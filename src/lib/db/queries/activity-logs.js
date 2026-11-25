import { query } from "@/lib/db";

export const ACTIVITY_LOGS_PER_PAGE = 15;

export const ACTIVITY_ACTIONS = ["create", "update", "delete", "approve", "reject", "role_change", "activate", "deactivate"];
export const ACTIVITY_ENTITIES = ["user", "course", "category", "teacher_application"];

/** Riwayat Aktivitas untuk Admin, terbaru lebih dulu. */
export async function listActivityLogs({ action = "", entityType = "", search = "", page = 1 } = {}) {
  const validAction = ACTIVITY_ACTIONS.includes(action) ? action : null;
  const validEntity = ACTIVITY_ENTITIES.includes(entityType) ? entityType : null;
  const keyword = search.trim() ? `%${search.trim()}%` : null;
  const offset = (Math.max(1, page) - 1) * ACTIVITY_LOGS_PER_PAGE;
  const where = `($1::text IS NULL OR action = $1)
             AND ($2::text IS NULL OR entity_type = $2)
             AND ($3::text IS NULL OR entity_label ILIKE $3 OR actor_name ILIKE $3)`;

  const [rows, total] = await Promise.all([
    query(
      `SELECT id, actor_name, actor_role, action, entity_type, entity_label, details, created_at
         FROM activity_logs
        WHERE ${where}
        ORDER BY created_at DESC
        LIMIT ${ACTIVITY_LOGS_PER_PAGE} OFFSET $4`,
      [validAction, validEntity, keyword, offset],
    ),
    query(`SELECT COUNT(*)::int AS total FROM activity_logs WHERE ${where}`, [validAction, validEntity, keyword]),
  ]);
  return { rows: rows.rows, total: total.rows[0].total, perPage: ACTIVITY_LOGS_PER_PAGE };
}
