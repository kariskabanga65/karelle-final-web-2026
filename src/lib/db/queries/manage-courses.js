import "server-only";
import { queryMany, queryOne } from "@/lib/db";


export async function listManagedCourses({ teacherId = null, search = "" } = {}) {
  const keyword = search.trim().slice(0, 100);
  const pattern = keyword ? `%${keyword.replace(/[\\%_]/g, "\\$&")}%` : null;
  return queryMany(
    `SELECT id, title, slug, category_name, teacher_id, teacher_name,
            start_date, end_date, content_count, student_count, created_at
       FROM v_course_catalog
      WHERE ($1::text IS NULL OR teacher_id = $1)
        AND ($2::text IS NULL OR title ILIKE $2 OR teacher_name ILIKE $2)
      ORDER BY created_at DESC`,
    [teacherId, pattern],
  );
}


export async function getCourseForEdit(id) {
  return queryOne(
    `SELECT id, title, slug, description, category_id, teacher_id, start_date, end_date, thumbnail_url
       FROM courses WHERE id = $1`,
    [id],
  );
}

export async function getCategoryById(id) {
  return queryOne(
    `SELECT cat.id, cat.name, cat.slug, cat.description,
            (SELECT COUNT(*) FROM courses c WHERE c.category_id = cat.id)::int AS course_count
       FROM categories cat WHERE cat.id = $1`,
    [id],
  );
}
