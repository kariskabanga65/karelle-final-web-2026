import "server-only";
import { queryMany } from "@/lib/db";

/**
 * Teacher beserta statistiknya. Hanya data publik yang diambil
 * (nama, headline, bio). Email dipakai untuk tombol "Hubungi Teacher".
 */
export async function getTeachers({ limit = null } = {}) {
  return queryMany(
    `SELECT u.id, u.name, u.username, u.email, u.headline, u.bio, u.image,
            COUNT(DISTINCT c.id)::int         AS course_count,
            COUNT(DISTINCT e.student_id)::int AS student_count,
            COALESCE(
              JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('title', c.title, 'slug', c.slug))
                FILTER (WHERE c.id IS NOT NULL),
              '[]'
            ) AS courses
       FROM users u
       LEFT JOIN courses c     ON c.teacher_id = u.id
       LEFT JOIN enrollments e ON e.course_id  = c.id
      WHERE u.role = 'teacher'
      GROUP BY u.id
      ORDER BY student_count DESC, u.name
      LIMIT $1`,
    [limit],
  );
}
