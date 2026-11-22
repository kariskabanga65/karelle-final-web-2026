import "server-only";
import { queryMany, queryOne } from "@/lib/db";

/**
 * Enrollment milik seorang student dalam bentuk Map
 * courseId -> { progress, status, lastContentId }.
 * Dipakai katalog untuk menentukan tombol "Ikuti" atau "Lanjutkan".
 */
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
