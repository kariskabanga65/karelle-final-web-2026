import "server-only";
import { queryMany, queryOne } from "@/lib/db";

/** Angka-angka untuk Admin Dashboard. */
export async function getAdminStats() {
  return queryOne(
    `SELECT
        (SELECT COUNT(*) FROM users)::int                                   AS total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'teacher')::int            AS total_teachers,
        (SELECT COUNT(*) FROM users WHERE role = 'student')::int            AS total_students,
        (SELECT COUNT(*) FROM courses)::int                                 AS total_courses,
        (SELECT COUNT(*) FROM categories)::int                              AS total_categories,
        (SELECT COUNT(*) FROM teacher_applications WHERE status = 'pending')::int AS pending_applications,
        (SELECT COUNT(*) FROM enrollments)::int                             AS total_enrollments,
        (SELECT COUNT(*) FROM certificates)::int                            AS total_certificates`,
  );
}

/** Jumlah pengajuan pending (badge di sidebar). */
export async function getPendingApplicationCount() {
  const row = await queryOne(`SELECT COUNT(*)::int AS count FROM teacher_applications WHERE status = 'pending'`);
  return row.count;
}

/**
 * Aktivitas terbaru dari beberapa tabel, digabung dengan UNION ALL
 * lalu diurutkan berdasarkan waktu.
 */
export async function getRecentActivity(limit = 8) {
  return queryMany(
    `SELECT * FROM (
        SELECT 'register' AS type, u.name AS actor, NULL AS target, u.created_at AS at
          FROM users u
        UNION ALL
        SELECT 'enroll', u.name, c.title, e.enrolled_at
          FROM enrollments e
          JOIN users u   ON u.id = e.student_id
          JOIN courses c ON c.id = e.course_id
        UNION ALL
        SELECT 'application', u.name, t.expertise, t.created_at
          FROM teacher_applications t
          JOIN users u ON u.id = t.user_id
        UNION ALL
        SELECT 'comment', u.name, cc.title, cm.created_at
          FROM comments cm
          JOIN users u            ON u.id = cm.user_id
          JOIN course_contents cc ON cc.id = cm.content_id
        UNION ALL
        SELECT 'certificate', ce.student_name, ce.course_title, ce.issued_at
          FROM certificates ce
     ) AS activity
     ORDER BY at DESC
     LIMIT $1`,
    [limit],
  );
}
