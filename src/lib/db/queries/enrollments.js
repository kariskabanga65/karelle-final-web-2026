import "server-only";
import { queryMany, queryOne } from "@/lib/db";

export async function getEnrollmentMap(studentId) {
  if (!studentId) return new Map();
  const rows = await queryMany(
    `SELECT course_id, progress_percent, status, last_content_id
       FROM enrollments
      WHERE student_id = $1`,
    [studentId],
  );
  return new Map(
    rows.map((row) => [
      row.course_id,
      {
        progress: Number(row.progress_percent),
        status: row.status,
        lastContentId: row.last_content_id,
      },
    ]),
  );
}

export async function getEnrollment(studentId, courseId) {
  return queryOne(
    `SELECT id, progress_percent, status, last_content_id
       FROM enrollments
      WHERE student_id = $1 AND course_id = $2`,
    [studentId, courseId],
  );
}

export async function countEnrollments(userId) {
  const row = await queryOne(`SELECT COUNT(*)::int AS total FROM enrollments WHERE student_id = $1`, [userId]);
  return row?.total ?? 0;
}
