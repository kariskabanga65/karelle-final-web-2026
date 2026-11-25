import "server-only";
import { queryMany, queryOne } from "@/lib/db";

/** Pengajuan Teacher terbaru milik seorang user, atau null. */
export async function getLatestTeacherApplication(userId) {
  return queryOne(
    `SELECT id, expertise, experience, motivation, status, approved_at, rejected_at, rejection_reason, created_at,
            (status = 'approved' AND approved_at > NOW() - INTERVAL '24 hours') AS is_newly_approved
       FROM teacher_applications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1`,
    [userId],
  );
}

/** Daftar pengajuan untuk Admin, pending lebih dulu. */
export async function listTeacherApplications(status = "pending") {
  const filter = ["pending", "approved", "rejected"].includes(status) ? status : null;
  return queryMany(
    `SELECT t.id, t.expertise, t.experience, t.motivation, t.status, t.created_at,
            t.approved_at, t.rejected_at, t.rejection_reason,
            u.id AS user_id, u.name, u.username, u.email, u.role,
            reviewer.name AS approved_by_name
       FROM teacher_applications t
       JOIN users u             ON u.id = t.user_id
       LEFT JOIN users reviewer ON reviewer.id = t.approved_by
      WHERE ($1::text IS NULL OR t.status = $1)
      ORDER BY (t.status = 'pending') DESC, t.created_at DESC`,
    [filter],
  );
}
