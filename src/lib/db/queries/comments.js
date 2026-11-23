import "server-only";
import { queryMany } from "@/lib/db";

export async function getDiscussion(contentId) {
  const rows = await queryMany(
    `SELECT cm.id, cm.parent_id, cm.body, cm.created_at, cm.user_id,
            u.name AS author_name, u.username AS author_username, u.image AS author_image, u.role AS author_role,
            (u.id = c.teacher_id) AS is_course_teacher
       FROM comments cm
       JOIN users u ON u.id = cm.user_id
       JOIN course_contents cc ON cc.id = cm.content_id
       JOIN courses c ON c.id = cc.course_id
      WHERE cm.content_id = $1
      ORDER BY cm.created_at ASC`,
    [contentId],
  );

  const threads = [];
  const byId = new Map();
  for (const row of rows) {
    if (!row.parent_id) {
      const thread = { ...row, replies: [] };
      threads.push(thread);
      byId.set(row.id, thread);
    }
  }
  for (const row of rows) {
    if (row.parent_id) byId.get(row.parent_id)?.replies.push(row);
  }
  return { threads: threads.reverse(), total: rows.length };
}
