import "server-only";
import { queryMany, queryOne } from "@/lib/db";
import { htmlToText } from "@/lib/utils/sanitize";

/**
 * Course yang boleh dikelola user.
 * ownerId diisi  -> hanya jika course milik Teacher tersebut.
 * ownerId null   -> Admin (semua course).
 * Mengembalikan null jika tidak ditemukan / bukan milik user,
 * sehingga halaman bisa menampilkan 404 (tidak membocorkan keberadaan data).
 */
export async function getManageableCourse(courseId, ownerId) {
  return queryOne(
    `SELECT c.id, c.title, c.slug, c.teacher_id, u.name AS teacher_name
       FROM courses c
       JOIN users u ON u.id = c.teacher_id
      WHERE c.id = $1 AND ($2::text IS NULL OR c.teacher_id = $2)`,
    [courseId, ownerId],
  );
}

/** Daftar materi satu course + jumlah student yang sudah menyelesaikannya. */
export async function listLessons(courseId) {
  const rows = await queryMany(
    `SELECT cc.id, cc.title, cc.order_index, cc.updated_at,
            LEFT(cc.content, 3000) AS content_head,
            (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.content_id = cc.id)::int AS completed_count,
            (SELECT COUNT(*) FROM comments cm WHERE cm.content_id = cc.id)::int AS comment_count
       FROM course_contents cc
      WHERE cc.course_id = $1
      ORDER BY cc.order_index`,
    [courseId],
  );
  // Ringkasan teks polos (tanpa tag HTML) untuk ditampilkan di daftar.
  return rows.map(({ content_head: head, ...lesson }) => ({ ...lesson, excerpt: htmlToText(head).slice(0, 220) }));
}

/** Satu materi untuk form edit, dipastikan milik course tersebut. */
export async function getLessonForEdit(lessonId, courseId) {
  return queryOne(
    `SELECT id, course_id, title, content, order_index
       FROM course_contents
      WHERE id = $1 AND course_id = $2`,
    [lessonId, courseId],
  );
}

export async function countEnrolledStudents(courseId) {
  const row = await queryOne(`SELECT COUNT(*)::int AS total FROM enrollments WHERE course_id = $1`, [courseId]);
  return row?.total ?? 0;
}
