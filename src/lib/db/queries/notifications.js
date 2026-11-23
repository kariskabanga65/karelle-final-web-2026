import "server-only";
import { queryMany, queryOne } from "@/lib/db";

export async function countUnreadNotifications(userId) {
  const row = await queryOne(`SELECT COUNT(*)::int AS total FROM notifications WHERE user_id = $1 AND NOT is_read`, [userId]);
  return row?.total ?? 0;
}

export async function listNotifications(userId, { unreadOnly = false, limit = 50 } = {}) {
  return queryMany(
    `SELECT id, type, title, message, link, is_read, created_at
       FROM notifications
      WHERE user_id = $1 AND ($2::boolean = FALSE OR NOT is_read)
      ORDER BY created_at DESC
      LIMIT $3`,
    [userId, unreadOnly, limit],
  );
}
