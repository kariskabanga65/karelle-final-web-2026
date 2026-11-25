"use server";

import { revalidatePath } from "next/cache";
import { authorizeAction } from "@/lib/auth/action-guard";
import { ROLES } from "@/lib/auth/roles";
import { withTransaction } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";
import { isUuid } from "@/lib/utils/slug";
import { actionError, actionSuccess } from "@/lib/utils/action-result";
import { rejectApplicationSchema } from "@/lib/validations/user";

/**
 * APPROVE: role user -> teacher, catat approved_at & approved_by,
 * kirim notifikasi. Semua dalam satu transaksi.
 */
export async function approveApplicationAction(applicationId) {
  const { user: admin, error } = await authorizeAction([ROLES.ADMIN]);
  if (error) return error;
  if (!isUuid(applicationId)) return actionError("Pengajuan tidak valid.");

  const result = await withTransaction(async (client) => {
    const { rows } = await client.query(
      `UPDATE teacher_applications
          SET status = 'approved', approved_at = NOW(), approved_by = $2
        WHERE id = $1 AND status = 'pending'
        RETURNING user_id, expertise`,
      [applicationId, admin.id],
    );
    if (rows.length === 0) return null;

    const { rows: users } = await client.query(
      `UPDATE users SET role = 'teacher' WHERE id = $1 RETURNING name`,
      [rows[0].user_id],
    );
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, 'teacher_approved', 'Selamat, Anda resmi menjadi Teacher!',
               'Pengajuan Teacher Anda telah disetujui Admin. Mulai buat course pertama Anda.', '/teacher')`,
      [rows[0].user_id],
    );
    return { name: users[0].name, userId: rows[0].user_id, expertise: rows[0].expertise };
  });

  if (!result) return actionError("Pengajuan tidak ditemukan atau sudah diproses.");
  await logActivity({
    actor: admin, action: "approve", entityType: "teacher_application", entityId: result.userId,
    entityLabel: result.name, details: { bidang_keahlian: result.expertise, role: { dari: "student", menjadi: "teacher" } },
  });
  revalidateAdmin();
  return actionSuccess(`${result.name} sekarang menjadi Teacher.`);
}

/** REJECT: status rejected, akun tetap Student. */
export async function rejectApplicationAction(applicationId, reason = "") {
  const { user: admin, error } = await authorizeAction([ROLES.ADMIN]);
  if (error) return error;
  if (!isUuid(applicationId)) return actionError("Pengajuan tidak valid.");

  const parsed = rejectApplicationSchema.safeParse({ reason });
  if (!parsed.success) return actionError(parsed.error.issues[0].message);
  const cleanReason = parsed.data.reason || null;

  const result = await withTransaction(async (client) => {
    const { rows } = await client.query(
      `UPDATE teacher_applications
          SET status = 'rejected', rejected_at = NOW(), rejection_reason = $2
        WHERE id = $1 AND status = 'pending'
        RETURNING user_id, expertise, (SELECT name FROM users WHERE id = user_id) AS name`,
      [applicationId, cleanReason],
    );
    if (rows.length === 0) return null;
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, 'teacher_rejected', 'Pengajuan Teacher ditolak', $2, '/profile')`,
      [rows[0].user_id, cleanReason ?? "Pengajuan Teacher Anda belum dapat disetujui."],
    );
    return rows[0];
  });

  if (!result) return actionError("Pengajuan tidak ditemukan atau sudah diproses.");
  await logActivity({
    actor: admin, action: "reject", entityType: "teacher_application", entityId: result.user_id,
    entityLabel: result.name, details: { bidang_keahlian: result.expertise, alasan: cleanReason },
  });
  revalidateAdmin();
  return actionSuccess(`Pengajuan ${result.name} ditolak. Akun tetap sebagai Student.`);
}

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/teacher-applications");
  revalidatePath("/admin/users");
}
