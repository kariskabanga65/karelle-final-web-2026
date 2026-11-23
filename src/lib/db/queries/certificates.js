import "server-only";
import { queryMany, queryOne } from "@/lib/db";

export const CERTIFICATE_NUMBER_PATTERN = /^KRL-\d{4}-[0-9A-F]{10}$/;

const COLUMNS = `ct.id, ct.certificate_number, ct.student_name, ct.course_title, ct.teacher_name, ct.issued_at,
                 ct.student_id, ct.course_id, c.slug AS course_slug, cat.name AS category_name`;
const JOINS = `LEFT JOIN courses c ON c.id = ct.course_id
               LEFT JOIN categories cat ON cat.id = c.category_id`;

export async function listStudentCertificates(studentId) {
  return queryMany(
    `SELECT ${COLUMNS} FROM certificates ct ${JOINS}
      WHERE ct.student_id = $1
      ORDER BY ct.issued_at DESC`,
    [studentId],
  );
}

export async function listClaimableCourses(studentId) {
  return queryMany(
    `SELECT c.id, c.title
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
      WHERE e.student_id = $1 AND e.progress_percent = 100
        AND NOT EXISTS (SELECT 1 FROM certificates ct WHERE ct.student_id = e.student_id AND ct.course_id = e.course_id)
      ORDER BY e.completed_at DESC NULLS LAST`,
    [studentId],
  );
}


export async function getCertificateForViewer(id, viewerId) {
  return queryOne(
    `SELECT ${COLUMNS} FROM certificates ct ${JOINS}
      WHERE ct.id = $1 AND ($2::text IS NULL OR ct.student_id = $2)`,
    [id, viewerId],
  );
}


export async function getCertificateByNumber(number) {
  return queryOne(
    `SELECT ct.certificate_number, ct.student_name, ct.course_title, ct.teacher_name, ct.issued_at
       FROM certificates ct
      WHERE ct.certificate_number = $1`,
    [number],
  );
}


export async function listAllCertificates({ search = "", page = 1, perPage = 15 } = {}) {
  const keyword = search.trim().slice(0, 100);
  const pattern = keyword ? `%${keyword.replace(/[\\%_]/g, "\\$&")}%` : null;
  const where = `WHERE ($1::text IS NULL OR ct.student_name ILIKE $1 OR ct.course_title ILIKE $1 OR ct.certificate_number ILIKE $1)`;
  const total = await queryOne(`SELECT COUNT(*)::int AS total FROM certificates ct ${where}`, [pattern]);
  const offset = (Math.max(1, page) - 1) * perPage;
  const rows = await queryMany(
    `SELECT ${COLUMNS} FROM certificates ct ${JOINS} ${where}
      ORDER BY ct.issued_at DESC
      LIMIT $2 OFFSET $3`,
    [pattern, perPage, offset],
  );
  return { rows, total: total.total, perPage };
}
