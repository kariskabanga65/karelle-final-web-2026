import "server-only";
import { queryMany, queryOne } from "@/lib/db";

export const USERS_PER_PAGE = 10;

/**
 * Daftar user untuk Admin: pencarian, filter role/status, dan pagination.
 * Status diambil dari pengajuan Teacher terbaru tiap user.
 */
export async function listUsers({ search = "", role = "", status = "", page = 1 } = {}) {
  const keyword = search.trim().slice(0, 100);
  const pattern = keyword ? `%${keyword.replace(/[\\%_]/g, "\\$&")}%` : null;
  const roleFilter = ["admin", "teacher", "student"].includes(role) ? role : null;
  const statusFilter = ["pending", "approved", "rejected"].includes(status) ? status : null;
  const offset = (Math.max(1, page) - 1) * USERS_PER_PAGE;

  const params = [pattern, roleFilter, statusFilter];
  const where = `
    WHERE ($1::text IS NULL OR u.name ILIKE $1 OR u.username ILIKE $1 OR u.email ILIKE $1)
      AND ($2::text IS NULL OR u.role = $2)
      AND ($3::text IS NULL OR ta.status = $3)`;
  const latestApplication = `
    LEFT JOIN LATERAL (
      SELECT status FROM teacher_applications
       WHERE user_id = u.id
       ORDER BY created_at DESC
       LIMIT 1
    ) ta ON TRUE`;

  const [rows, total] = await Promise.all([
    queryMany(
      `SELECT u.id, u.name, u.username, u.email, u.role, u.created_at,
              ta.status AS application_status
         FROM users u
         ${latestApplication}
         ${where}
        ORDER BY u.created_at DESC
        LIMIT ${USERS_PER_PAGE} OFFSET $4`,
      [...params, offset],
    ),
    queryOne(`SELECT COUNT(*)::int AS count FROM users u ${latestApplication} ${where}`, params),
  ]);

  return {
    users: rows,
    total: total.count,
    totalPages: Math.max(1, Math.ceil(total.count / USERS_PER_PAGE)),
  };
}

export async function getUserById(id) {
  return queryOne(
    `SELECT id, name, username, email, role, headline, bio, created_at FROM users WHERE id = $1`,
    [id],
  );
}

/** Pilihan Teacher untuk dropdown di form course (khusus Admin). */
export async function getTeacherOptions() {
  return queryMany(`SELECT id, name, username FROM users WHERE role = 'teacher' ORDER BY name`);
}
