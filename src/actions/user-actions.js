"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { authorizeAction } from "@/lib/auth/action-guard";
import { ROLES } from "@/lib/auth/roles";
import { query, queryOne, withTransaction } from "@/lib/db";
import { getDbErrorMessage } from "@/lib/db/errors";
import { logActivity } from "@/lib/activity-log";
import { actionError, actionSuccess, formDataToObject, validationError } from "@/lib/utils/action-result";
import { createUserSchema, teacherApplicationSchema, updateUserSchema } from "@/lib/validations/user";

/**
 * User Management (khusus Admin).
 * Akun dibuat lewat Better Auth (internalAdapter), sehingga password
 * di-hash dengan fungsi bcrypt yang sama seperti saat register.
 */

export async function createUserAction(_prevState, formData) {
  const { user: admin, error } = await authorizeAction([ROLES.ADMIN]);
  if (error) return error;

  const input = formDataToObject(formData);
  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error, input);
  const { name, username, email, password, role, expertise, experience, motivation } = parsed.data;

  // Bidang keahlian harus salah satu kategori yang dikelola Admin.
  if (role === ROLES.TEACHER) {
    const category = await queryOne(`SELECT 1 AS ok FROM categories WHERE name = $1`, [expertise]);
    if (!category) return actionError("Periksa kembali isian Anda.", { expertise: ["Bidang keahlian tidak valid."] }, input);
  }

  const duplicate = await findDuplicate({ email, username }, null, input);
  if (duplicate) return duplicate;

  const ctx = await auth.$context;
  let createdUserId = null;
  try {
    const user = await ctx.internalAdapter.createUser({ name, username, email, emailVerified: true });
    createdUserId = user.id;
    await ctx.internalAdapter.linkAccount({
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: await ctx.password.hash(password), // bcrypt.hash()
    });
    // Better Auth selalu membuat akun sebagai student; Admin lalu menetapkan role.
    await withTransaction(async (client) => {
      await client.query(`UPDATE users SET role = $1 WHERE id = $2`, [role, user.id]);
      // Teacher yang dibuat Admin langsung tercatat sebagai pengajuan yang disetujui,
      // sehingga datanya sama dengan Teacher yang mendaftar sendiri lalu di-approve.
      if (role === ROLES.TEACHER) {
        await client.query(
          `INSERT INTO teacher_applications (user_id, expertise, experience, motivation, status, approved_at, approved_by)
           VALUES ($1, $2, $3, $4, 'approved', NOW(), $5)`,
          [user.id, expertise, experience, motivation, admin.id],
        );
      }
    });
  } catch (err) {
    console.error("[users] create", err);
    if (createdUserId) await query(`DELETE FROM users WHERE id = $1`, [createdUserId]);
    return actionError(getDbErrorMessage(err, "Gagal membuat user."), {}, input);
  }

  await logActivity({
    actor: admin,
    action: "create",
    entityType: "user",
    entityId: createdUserId,
    entityLabel: `${name} (@${username})`,
    details: { email, role, ...(role === ROLES.TEACHER ? { bidang_keahlian: expertise } : {}) },
  });
  revalidatePath("/admin/users");
  redirect("/admin/users?success=created");
}

export async function updateUserAction(userId, _prevState, formData) {
  const { user: admin, error } = await authorizeAction([ROLES.ADMIN]);
  if (error) return error;

  const input = formDataToObject(formData);
  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error, input);
  const { name, username, email, password } = parsed.data;

  const target = await queryOne(`SELECT id, role, name, username, email FROM users WHERE id = $1`, [userId]);
  if (!target) return actionError("User tidak ditemukan.", {}, input);

  // Role akun Admin tidak diubah lewat form, dan user yang sudah ada tidak bisa
  // diubah menjadi Admin (EDIT_ROLE_VALUES hanya student/teacher).
  const isAdminAccount = target.role === ROLES.ADMIN;
  const role = isAdminAccount ? ROLES.ADMIN : parsed.data.role;
  if (!role) return actionError("Periksa kembali data yang Anda isi.", { role: ["Role wajib dipilih."] }, input);

  const becomesTeacher = target.role === ROLES.STUDENT && role === ROLES.TEACHER;
  const becomesStudent = target.role === ROLES.TEACHER && role === ROLES.STUDENT;

  // Student -> Teacher: wajib mengisi data yang sama seperti form register Teacher.
  let teacherData = null;
  if (becomesTeacher) {
    const teacher = teacherApplicationSchema.safeParse(input);
    if (!teacher.success) return validationError(teacher.error, input);
    teacherData = teacher.data;
    const category = await queryOne(`SELECT 1 AS ok FROM categories WHERE name = $1`, [teacherData.expertise]);
    if (!category) return actionError("Periksa kembali isian Anda.", { expertise: ["Bidang keahlian tidak valid."] }, input);
  }

  // Teacher -> Student: Teacher yang masih punya course tidak boleh diganti role-nya,
  // agar tidak ada course yang instrukturnya bukan Teacher.
  if (becomesStudent) {
    const owned = await queryOne(`SELECT COUNT(*)::int AS total FROM courses WHERE teacher_id = $1`, [userId]);
    if (owned.total > 0) {
      return actionError(
        `Teacher ini masih memiliki ${owned.total} course.`,
        { role: ["Pindahkan atau hapus course milik teacher ini terlebih dahulu."] },
        input,
      );
    }
  }

  const duplicate = await findDuplicate({ email, username }, userId, input);
  if (duplicate) return duplicate;

  try {
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE users SET name = $1, username = $2, email = $3, role = $4 WHERE id = $5`,
        [name, username, email, role, userId],
      );

      if (becomesTeacher) {
        // Pengajuan pending (jika ada) diperbarui lalu disetujui; jika tidak ada,
        // dibuat pengajuan baru yang langsung disetujui. approved_at selalu tercatat.
        const { rowCount } = await client.query(
          `UPDATE teacher_applications
              SET expertise = $2, experience = $3, motivation = $4,
                  status = 'approved', approved_at = NOW(), approved_by = $5
            WHERE user_id = $1 AND status = 'pending'`,
          [userId, teacherData.expertise, teacherData.experience, teacherData.motivation, admin.id],
        );
        if (rowCount === 0) {
          await client.query(
            `INSERT INTO teacher_applications (user_id, expertise, experience, motivation, status, approved_at, approved_by)
             VALUES ($1, $2, $3, $4, 'approved', NOW(), $5)`,
            [userId, teacherData.expertise, teacherData.experience, teacherData.motivation, admin.id],
          );
        }
        await client.query(
          `INSERT INTO notifications (user_id, type, title, message, link)
           VALUES ($1, 'teacher_approved', 'Selamat, Anda resmi menjadi Teacher!',
                   'Admin telah mengubah akun Anda menjadi Teacher. Mulai buat course pertama Anda.', '/teacher')`,
          [userId],
        );
      }

      if (becomesStudent) {
        // Student tidak punya bidang keahlian, pengalaman, dan motivasi.
        await client.query(`DELETE FROM teacher_applications WHERE user_id = $1`, [userId]);
      }
    });

    if (password) {
      const ctx = await auth.$context;
      await ctx.internalAdapter.updatePassword(userId, await ctx.password.hash(password));
    }
  } catch (err) {
    console.error("[users] update", err);
    return actionError(getDbErrorMessage(err, "Gagal menyimpan perubahan."), {}, input);
  }

  const changes = {};
  if (target.name !== name) changes.name = { dari: target.name, menjadi: name };
  if (target.username !== username) changes.username = { dari: target.username, menjadi: username };
  if (target.email !== email) changes.email = { dari: target.email, menjadi: email };
  if (password) changes.password = "diganti";
  if (Object.keys(changes).length > 0) {
    await logActivity({ actor: admin, action: "update", entityType: "user", entityId: userId, entityLabel: `${name} (@${username})`, details: changes });
  }
  if (target.role !== role) {
    await logActivity({
      actor: admin,
      action: "role_change",
      entityType: "user",
      entityId: userId,
      entityLabel: `${name} (@${username})`,
      details: {
        role: { dari: target.role, menjadi: role },
        ...(becomesTeacher ? { bidang_keahlian: teacherData.expertise } : {}),
        ...(becomesStudent ? { catatan: "Data bidang keahlian, pengalaman, dan motivasi dihapus." } : {}),
      },
    });
  }
  revalidatePath("/admin/users");
  redirect("/admin/users?success=updated");
}

export async function deleteUserAction(userId) {
  const { user: admin, error } = await authorizeAction([ROLES.ADMIN]);
  if (error) return error;
  if (userId === admin.id) return actionError("Anda tidak dapat menghapus akun Anda sendiri.");

  try {
    const result = await query(
      `DELETE FROM users WHERE id = $1 RETURNING name, username, email, role, created_at`,
      [userId],
    );
    if (result.rowCount === 0) return actionError("User tidak ditemukan.");
    const deleted = result.rows[0];
    await logActivity({
      actor: admin,
      action: "delete",
      entityType: "user",
      entityId: userId,
      entityLabel: `${deleted.name} (@${deleted.username})`,
      details: { email: deleted.email, role: deleted.role, terdaftar: deleted.created_at },
    });
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return actionSuccess(`User ${result.rows[0].name} berhasil dihapus.`);
  } catch (err) {
    // courses.teacher_id ON DELETE RESTRICT
    return actionError(getDbErrorMessage(err, "Gagal menghapus user."));
  }
}

async function findDuplicate({ email, username }, excludeId, input) {
  const row = await queryOne(
    `SELECT
        EXISTS (SELECT 1 FROM users WHERE email = $1    AND id IS DISTINCT FROM $3) AS email_taken,
        EXISTS (SELECT 1 FROM users WHERE username = $2 AND id IS DISTINCT FROM $3) AS username_taken`,
    [email, username, excludeId],
  );
  const fieldErrors = {};
  if (row.email_taken) fieldErrors.email = ["Email sudah dipakai user lain."];
  if (row.username_taken) fieldErrors.username = ["Username sudah dipakai user lain."];
  return Object.keys(fieldErrors).length ? actionError("Periksa kembali data yang Anda isi.", fieldErrors, input) : null;
}
