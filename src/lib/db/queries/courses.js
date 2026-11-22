import "server-only";
import { queryMany, queryOne } from "@/lib/db";

/**
 * Query course untuk halaman publik (homepage, katalog, detail).
 * Data diambil dari view v_course_catalog (lihat database/schema.sql)
 * yang sudah berisi nama kategori, teacher, jumlah materi, dan jumlah student.
 */

const CATALOG_COLUMNS = `
  id, title, slug, description, start_date, end_date, thumbnail_url, created_at,
  category_id, category_name, category_slug,
  teacher_id, teacher_name, teacher_username, teacher_email, teacher_headline,
  content_count, student_count`;

/** 5 course terpopuler (paling banyak student). */
export async function getPopularCourses(limit = 5) {
  return queryMany(
    `SELECT ${CATALOG_COLUMNS}
       FROM v_course_catalog
      ORDER BY student_count DESC, created_at DESC
      LIMIT $1`,
    [limit],
  );
}

/**
 * Pencarian katalog. Semua input dikirim sebagai parameter ($1, $2),
 * karakter wildcard % dan _ di-escape agar dicari sebagai teks biasa.
 */
export async function searchCourses({ search = "", categorySlug = "" } = {}) {
  const keyword = search.trim().slice(0, 100);
  const pattern = keyword ? `%${keyword.replace(/[\\%_]/g, "\\$&")}%` : null;

  return queryMany(
    `SELECT ${CATALOG_COLUMNS}
       FROM v_course_catalog
      WHERE ($1::text IS NULL
             OR title ILIKE $1 OR description ILIKE $1 OR teacher_name ILIKE $1)
        AND ($2::text IS NULL OR category_slug = $2)
      ORDER BY student_count DESC, title ASC`,
    [pattern, categorySlug || null],
  );
}

export async function getCourseBySlug(slug) {
  return queryOne(`SELECT ${CATALOG_COLUMNS} FROM v_course_catalog WHERE slug = $1`, [slug]);
}

/** Daftar judul materi (silabus). Isi materi tidak ditampilkan ke publik. */
export async function getCourseOutline(courseId) {
  return queryMany(
    `SELECT id, title, order_index
       FROM course_contents
      WHERE course_id = $1
      ORDER BY order_index`,
    [courseId],
  );
}

/** Kelas untuk section "Modeling Programs", diurutkan sesuai urutan kategori. */
export async function getProgramCourses(limit = 4) {
  return queryMany(
    `SELECT v.*
       FROM v_course_catalog v
       JOIN categories cat ON cat.id = v.category_id
      ORDER BY cat.created_at, v.created_at
      LIMIT $1`,
    [limit],
  );
}

/** Kategori beserta jumlah course-nya. */
export async function getCategoriesWithCourseCount() {
  return queryMany(
    `SELECT cat.id, cat.name, cat.slug, cat.description,
            COUNT(c.id)::int AS course_count
       FROM categories cat
       LEFT JOIN courses c ON c.category_id = cat.id
      GROUP BY cat.id
      ORDER BY cat.created_at, cat.name`,
  );
}

/** Statistik singkat untuk homepage. */
export async function getPlatformStats() {
  return queryOne(
    `SELECT
        (SELECT COUNT(*) FROM courses)::int                    AS course_count,
        (SELECT COUNT(*) FROM users WHERE role = 'teacher')::int AS teacher_count,
        (SELECT COUNT(*) FROM users WHERE role = 'student')::int AS student_count`,
  );
}
