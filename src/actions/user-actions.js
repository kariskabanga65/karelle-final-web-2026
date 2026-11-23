"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { authorizeAction } from "@/lib/auth/action-guard";
import { ROLES } from "@/lib/auth/roles";
import { query, queryOne, withTransaction } from "@/lib/db";
import { getDbErrorMessage } from "@/lib/db/errors";
import { actionError, actionSuccess, formDataToObject, validationError } from "@/lib/utils/action-result";
import { createUserSchema, updateUserSchema } from "@/lib/validations/user";


export async function createUserAction(_prevState, formData) {
  const { error } = await authorizeAction([ROLES.ADMIN]);
  if (error) return error;

  const input = formDataToObject(formData);
  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error, input);
  const { name, username, email, password, role } = parsed.data;

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
      password: await ctx.password.hash(password), 
    });
    await query(`UPDATE users SET role = $1 WHERE id = $2`, [role, user.id]);
  } catch (err) {
    console.error("[users] create", err);
    if (createdUserId) await query(`DELETE FROM users WHERE id = $1`, [createdUserId]);
    return actionError(getDbErrorMessage(err, "Gagal membuat user."), {}, input);
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?success=created");
}

export async function updateUserAction(userId, _prevState, formData) {
  const { user: admin, error } = await authorizeAction([ROLES.ADMIN]);
  if (error) return error;

  const input = formDataToObject(formData);
  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error, input);
  const { name, username, email, password, role } = parsed.data;

  const target = await queryOne(`SELECT id, role FROM users WHERE id = $1`, [userId]);
  if (!target) return actionError("User tidak ditemukan.", {}, input);
  if (userId === admin.id && role !== ROLES.ADMIN) {
    return actionError("Anda tidak dapat menurunkan role akun Anda sendiri.", { role: ["Role akun sendiri harus tetap Admin."] }, input);
  }
  if (target.role === ROLES.TEACHER && role !== ROLES.TEACHER) {
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
      if (role === ROLES.TEACHER && target.role !== ROLES.TEACHER) {
        await client.query(
          `UPDATE teacher_applications
              SET status = 'approved', approved_at = NOW(), approved_by = $2
            WHERE user_id = $1 AND status = 'pending'`,
          [userId, admin.id],
        );
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

  revalidatePath("/admin/users");
  redirect("/admin/users?success=updated");
}

export async function deleteUserAction(userId) {
  const { user: admin, error } = await authorizeAction([ROLES.ADMIN]);
  if (error) return error;
  if (userId === admin.id) return actionError("Anda tidak dapat menghapus akun Anda sendiri.");

  try {
    const result = await query(`DELETE FROM users WHERE id = $1 RETURNING name`, [userId]);
    if (result.rowCount === 0) return actionError("User tidak ditemukan.");
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return actionSuccess(`User ${result.rows[0].name} berhasil dihapus.`);
  } catch (err) {
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
