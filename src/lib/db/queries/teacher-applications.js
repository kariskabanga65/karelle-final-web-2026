import "server-only";
import { queryOne } from "@/lib/db";

/** Pengajuan Teacher terbaru milik seorang user, atau null. */
export async function getLatestTeacherApplication(userId) {
  return queryOne(
    `SELECT id, expertise, status, approved_at, rejected_at, rejection_reason, created_at,
            (status = 'approved' AND approved_at > NOW() - INTERVAL '24 hours') AS is_newly_approved
       FROM teacher_applications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1`,
    [userId],
  );
}
