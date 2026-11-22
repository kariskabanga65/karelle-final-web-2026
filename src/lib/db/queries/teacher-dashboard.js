import "server-only";
import { queryMany, queryOne } from "@/lib/db";


export async function getTeacherStats(teacherId) {
  return queryOne(
    `SELECT
        (SELECT COUNT(*) FROM courses c
          WHERE ($1::text IS NULL OR c.teacher_id = $1))::int AS total_courses,
        (SELECT COUNT(*) FROM course_contents cc JOIN courses c ON c.id = cc.course_id
          WHERE ($1::text IS NULL OR c.teacher_id = $1))::int AS total_lessons,
        (SELECT COUNT(DISTINCT e.student_id) FROM enrollments e JOIN courses c ON c.id = e.course_id
          WHERE ($1::text IS NULL OR c.teacher_id = $1))::int AS total_students,
        (SELECT COUNT(*) FROM enrollments e JOIN courses c ON c.id = e.course_id
          WHERE ($1::text IS NULL OR c.teacher_id = $1))::int AS total_enrollments,
        (SELECT COUNT(*) FROM enrollments e JOIN courses c ON c.id = e.course_id
          WHERE ($1::text IS NULL OR c.teacher_id = $1) AND e.status = 'completed')::int AS completed_enrollments,
        (SELECT COALESCE(ROUND(AVG(e.progress_percent)), 0) FROM enrollments e JOIN courses c ON c.id = e.course_id
          WHERE ($1::text IS NULL OR c.teacher_id = $1))::int AS average_progress`,
    [teacherId],
  );
}

export async function getTeacherCourseSummaries(teacherId) {
  return queryMany(
    `SELECT c.id, c.title, c.slug, cat.name AS category_name,
            (SELECT COUNT(*) FROM course_contents cc WHERE cc.course_id = c.id)::int AS content_count,
            COUNT(e.id)::int AS student_count,
            COALESCE(ROUND(AVG(e.progress_percent)), 0)::int AS average_progress,
            COUNT(e.id) FILTER (WHERE e.status = 'completed')::int AS completed_count
       FROM courses c
       JOIN categories cat ON cat.id = c.category_id
       LEFT JOIN enrollments e ON e.course_id = c.id
      WHERE ($1::text IS NULL OR c.teacher_id = $1)
      GROUP BY c.id, cat.name
      ORDER BY c.created_at DESC`,
    [teacherId],
  );
}

export async function getTeacherActivity(teacherId, limit = 8) {
  return queryMany(
    `SELECT * FROM (
        SELECT 'enroll' AS type, u.name AS actor, c.title AS target, e.enrolled_at AS at
          FROM enrollments e
          JOIN users u ON u.id = e.student_id
          JOIN courses c ON c.id = e.course_id
         WHERE ($1::text IS NULL OR c.teacher_id = $1)
        UNION ALL
        SELECT 'lesson', u.name, cc.title, lp.completed_at
          FROM lesson_progress lp
          JOIN enrollments e ON e.id = lp.enrollment_id
          JOIN users u ON u.id = e.student_id
          JOIN course_contents cc ON cc.id = lp.content_id
          JOIN courses c ON c.id = lp.course_id
         WHERE ($1::text IS NULL OR c.teacher_id = $1)
        UNION ALL
        SELECT 'comment', u.name, cc.title, cm.created_at
          FROM comments cm
          JOIN users u ON u.id = cm.user_id
          JOIN course_contents cc ON cc.id = cm.content_id
          JOIN courses c ON c.id = cc.course_id
         WHERE ($1::text IS NULL OR c.teacher_id = $1) AND cm.user_id IS DISTINCT FROM $1
        UNION ALL
        SELECT 'completed', u.name, c.title, e.completed_at
          FROM enrollments e
          JOIN users u ON u.id = e.student_id
          JOIN courses c ON c.id = e.course_id
         WHERE ($1::text IS NULL OR c.teacher_id = $1) AND e.completed_at IS NOT NULL
     ) activity
     ORDER BY at DESC
     LIMIT $2`,
    [teacherId, limit],
  );
}

export async function getTeacherCourseOptions(teacherId) {
  return queryMany(
    `SELECT id, title FROM courses
      WHERE ($1::text IS NULL OR teacher_id = $1)
      ORDER BY title`,
    [teacherId],
  );
}

export async function listStudentProgress({ teacherId, courseId = null, search = "", status = "", page = 1, perPage = 15 }) {
  const keyword = search.trim().slice(0, 100);
  const pattern = keyword ? `%${keyword.replace(/[\\%_]/g, "\\$&")}%` : null;
  const statusFilter = ["active", "completed"].includes(status) ? status : null;
  const params = [teacherId, courseId, pattern, statusFilter];
  const where = `
      WHERE ($1::text IS NULL OR c.teacher_id = $1)
        AND ($2::uuid IS NULL OR c.id = $2)
        AND ($3::text IS NULL OR u.name ILIKE $3 OR u.username ILIKE $3 OR u.email ILIKE $3)
        AND ($4::text IS NULL OR e.status = $4)`;

  const totalRow = await queryOne(
    `SELECT COUNT(*)::int AS total
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       JOIN courses c ON c.id = e.course_id
     ${where}`,
    params,
  );

  const offset = (Math.max(1, page) - 1) * perPage;
  const rows = await queryMany(
    `SELECT e.id AS enrollment_id, e.status, e.progress_percent, e.enrolled_at, e.completed_at,
            u.id AS student_id, u.name AS student_name, u.username, u.email, u.image,
            c.id AS course_id, c.title AS course_title, c.slug AS course_slug,
            (SELECT COUNT(*) FROM course_contents cc WHERE cc.course_id = c.id)::int AS total_lessons,
            (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.enrollment_id = e.id)::int AS completed_lessons,
            (SELECT MAX(lp.completed_at) FROM lesson_progress lp WHERE lp.enrollment_id = e.id) AS last_activity_at,
            last_cc.title AS last_lesson_title
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       JOIN courses c ON c.id = e.course_id
       LEFT JOIN course_contents last_cc ON last_cc.id = e.last_content_id
     ${where}
      ORDER BY e.progress_percent DESC, u.name
      LIMIT $5 OFFSET $6`,
    [...params, perPage, offset],
  );

  return { rows, total: totalRow.total, page: Math.max(1, page), perPage };
}
