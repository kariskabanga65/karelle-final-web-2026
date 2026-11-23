import "server-only";
import { queryMany, queryOne } from "@/lib/db";
import { prefixed } from "./courses";

export async function getStudentStats(studentId) {
  return queryOne(
    `SELECT COUNT(*)::int AS total_courses,
            COUNT(*) FILTER (WHERE e.status = 'completed')::int AS completed_courses,
            COUNT(*) FILTER (WHERE e.status = 'active')::int AS active_courses,
            COALESCE(ROUND(AVG(e.progress_percent)), 0)::int AS average_progress,
            (SELECT COUNT(*) FROM lesson_progress lp
               JOIN enrollments e2 ON e2.id = lp.enrollment_id
              WHERE e2.student_id = $1)::int AS completed_lessons,
            (SELECT COUNT(*) FROM certificates ct WHERE ct.student_id = $1)::int AS certificates
       FROM enrollments e
      WHERE e.student_id = $1`,
    [studentId],
  );
}


export async function listStudentCourses(studentId, status = "") {
  const statusFilter = ["active", "completed"].includes(status) ? status : null;
  return queryMany(
    `SELECT e.id AS enrollment_id, e.status, e.progress_percent, e.enrolled_at, e.completed_at,
            e.last_content_id, e.updated_at,
            c.id AS course_id, c.title, c.slug, c.description, c.thumbnail_url, c.start_date, c.end_date,
            (c.start_date IS NOT NULL AND c.start_date > CURRENT_DATE) AS not_started,
            cat.name AS category_name, cat.slug AS category_slug,
            t.name AS teacher_name,
            (SELECT COUNT(*) FROM course_contents cc WHERE cc.course_id = c.id)::int AS total_lessons,
            (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.enrollment_id = e.id)::int AS completed_lessons,
            last_cc.title AS last_lesson_title,
            next_cc.id AS next_lesson_id, next_cc.title AS next_lesson_title
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       JOIN categories cat ON cat.id = c.category_id
       JOIN users t ON t.id = c.teacher_id
       LEFT JOIN course_contents last_cc ON last_cc.id = e.last_content_id
       LEFT JOIN LATERAL (
            SELECT cc.id, cc.title FROM course_contents cc
             WHERE cc.course_id = c.id
               AND NOT EXISTS (SELECT 1 FROM lesson_progress lp WHERE lp.enrollment_id = e.id AND lp.content_id = cc.id)
             ORDER BY cc.order_index LIMIT 1
       ) next_cc ON TRUE
      WHERE e.student_id = $1 AND ($2::text IS NULL OR e.status = $2)
      ORDER BY (e.status = 'completed'), e.updated_at DESC`,
    [studentId, statusFilter],
  );
}

export async function getRecommendedCourses(studentId, limit = 3) {
  return queryMany(
    `SELECT ${prefixed("v")}
       FROM v_course_catalog v
      WHERE NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.course_id = v.id AND e.student_id = $1)
      ORDER BY v.student_count DESC, v.created_at DESC
      LIMIT $2`,
    [studentId, limit],
  );
}
