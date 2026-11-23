import "server-only";
import { query, queryMany, queryOne } from "@/lib/db";

/**
 * Query untuk ruang belajar Student.
 * Semua akses materi selalu dicek lewat enrollment milik student,
 * sehingga student tidak bisa membaca materi course yang tidak diikutinya.
 */

/** Data course + status periode (belum mulai / sudah berakhir) menurut tanggal database. */
export async function getLearningCourse(courseId) {
  return queryOne(
    `SELECT c.id, c.title, c.slug, c.start_date, c.end_date, c.teacher_id,
            u.name AS teacher_name, u.image AS teacher_image, u.headline AS teacher_headline,
            (c.start_date IS NOT NULL AND c.start_date > CURRENT_DATE) AS not_started,
            (c.end_date IS NOT NULL AND c.end_date < CURRENT_DATE) AS ended
       FROM courses c
       JOIN users u ON u.id = c.teacher_id
      WHERE c.id = $1`,
    [courseId],
  );
}

/** Daftar materi untuk sidebar, dengan tanda selesai jika ada enrollment. */
export async function getLessonOutline(courseId, enrollmentId = null) {
  return queryMany(
    `SELECT cc.id, cc.title, cc.order_index,
            (lp.id IS NOT NULL) AS completed
       FROM course_contents cc
       LEFT JOIN lesson_progress lp ON lp.content_id = cc.id AND lp.enrollment_id = $2
      WHERE cc.course_id = $1
      ORDER BY cc.order_index`,
    [courseId, enrollmentId],
  );
}

/** Satu materi; WHERE course_id memastikan materi memang bagian dari course tersebut. */
export async function getLesson(courseId, contentId) {
  return queryOne(
    `SELECT id, course_id, title, content, order_index, updated_at
       FROM course_contents
      WHERE id = $1 AND course_id = $2`,
    [contentId, courseId],
  );
}

/** Mencatat materi terakhir yang dibuka (untuk tombol "Lanjutkan"). */
export async function rememberLastLesson(enrollmentId, contentId) {
  await query(
    `UPDATE enrollments SET last_content_id = $2
      WHERE id = $1 AND last_content_id IS DISTINCT FROM $2`,
    [enrollmentId, contentId],
  );
}

/**
 * Materi tujuan tombol "Lanjutkan":
 * 1. materi terakhir dibuka jika belum selesai,
 * 2. jika sudah selesai -> materi belum selesai berikutnya,
 * 3. jika semua selesai -> materi terakhir dibuka / materi pertama.
 */
export function pickContinueLesson(outline, lastContentId) {
  if (outline.length === 0) return null;
  const last = outline.find((lesson) => lesson.id === lastContentId);
  if (last && !last.completed) return last;
  const startIndex = last ? outline.indexOf(last) : -1;
  const nextUnfinished =
    outline.slice(startIndex + 1).find((lesson) => !lesson.completed) ?? outline.find((lesson) => !lesson.completed);
  return nextUnfinished ?? last ?? outline[0];
}
