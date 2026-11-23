"use server";

import { revalidatePath } from "next/cache";
import { authorizeAction } from "@/lib/auth/action-guard";
import { ROLES } from "@/lib/auth/roles";
import { queryOne, withTransaction } from "@/lib/db";
import { getDbErrorMessage } from "@/lib/db/errors";
import { actionError, actionSuccess, formDataToObject, validationError } from "@/lib/utils/action-result";
import { isUuid } from "@/lib/utils/slug";
import { commentSchema } from "@/lib/validations/comment";


export async function createCommentAction(contentId, parentId, _prevState, formData) {
  const { user, error } = await authorizeAction();
  if (error) return error;

  const input = formDataToObject(formData);
  const parsed = commentSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error, input);

  const access = await getDiscussionAccess(user, contentId);
  if (!access) return actionError("Anda tidak memiliki akses ke diskusi materi ini.", {}, input);

  try {
    await withTransaction(async (client) => {
      let rootId = null;
      let parentAuthor = null;
      if (parentId) {
        if (!isUuid(parentId)) throw new UserError("Komentar yang dibalas tidak ditemukan.");
        const { rows } = await client.query(
          `SELECT id, parent_id, user_id FROM comments WHERE id = $1 AND content_id = $2`,
          [parentId, access.content_id],
        );
        if (rows.length === 0) throw new UserError("Komentar yang dibalas tidak ditemukan.");
        rootId = rows[0].parent_id ?? rows[0].id;
        parentAuthor = rows[0].user_id;
      }

      await client.query(
        `INSERT INTO comments (content_id, user_id, parent_id, body) VALUES ($1, $2, $3, $4)`,
        [access.content_id, user.id, rootId, parsed.data.body],
      );
      const recipients = new Set();
      if (parentAuthor && parentAuthor !== user.id) recipients.add(parentAuthor);
      if (!parentId && access.teacher_id !== user.id) recipients.add(access.teacher_id);
      for (const recipientId of recipients) {
        const isTeacher = recipientId === access.teacher_id;
        await client.query(
          `INSERT INTO notifications (user_id, type, title, message, link) VALUES ($1, 'new_comment', $2, $3, $4)`,
          [
            recipientId,
            parentId ? "Balasan baru di diskusi" : "Pertanyaan baru dari student",
            `${user.name} ${parentId ? "membalas" : "berdiskusi"} di materi "${access.lesson_title}" (${access.course_title}).`,
            isTeacher
              ? `/teacher/courses/${access.course_id}/contents/${access.content_id}/discussion`
              : `/student/learn/${access.course_id}/${access.content_id}#diskusi`,
          ],
        );
      }
    });
  } catch (err) {
    if (err instanceof UserError) return actionError(err.message, {}, input);
    return actionError(getDbErrorMessage(err, "Gagal mengirim komentar."), {}, input);
  }

  revalidateDiscussion(access);
  return actionSuccess(parentId ? "Balasan terkirim." : "Komentar terkirim.", { sentAt: Date.now() });
}

export async function deleteCommentAction(commentId) {
  const { user, error } = await authorizeAction();
  if (error) return error;
  if (!isUuid(commentId)) return actionError("Komentar tidak ditemukan.");

  const comment = await queryOne(
    `SELECT cm.id, cm.user_id, cm.content_id, cc.course_id, c.teacher_id
       FROM comments cm
       JOIN course_contents cc ON cc.id = cm.content_id
       JOIN courses c ON c.id = cc.course_id
      WHERE cm.id = $1`,
    [commentId],
  );
  const allowed =
    comment && (comment.user_id === user.id || comment.teacher_id === user.id || user.role === ROLES.ADMIN);
  if (!allowed) return actionError("Anda tidak dapat menghapus komentar ini.");

  try {
    await queryOne(`DELETE FROM comments WHERE id = $1 RETURNING id`, [comment.id]);
  } catch (err) {
    return actionError(getDbErrorMessage(err, "Gagal menghapus komentar."));
  }
  revalidateDiscussion(comment);
  return actionSuccess("Komentar dihapus.");
}


class UserError extends Error {}


async function getDiscussionAccess(user, contentId) {
  if (!isUuid(contentId)) return null;
  return queryOne(
    `SELECT cc.id AS content_id, cc.title AS lesson_title, c.id AS course_id, c.title AS course_title, c.teacher_id
       FROM course_contents cc
       JOIN courses c ON c.id = cc.course_id
      WHERE cc.id = $1
        AND (
          $3 = 'admin'
          OR c.teacher_id = $2
          OR EXISTS (SELECT 1 FROM enrollments e WHERE e.course_id = c.id AND e.student_id = $2)
        )`,
    [contentId, user.id, user.role],
  );
}

function revalidateDiscussion({ course_id: courseId, content_id: contentId }) {
  revalidatePath(`/student/learn/${courseId}/${contentId}`);
  revalidatePath(`/teacher/courses/${courseId}/contents/${contentId}/discussion`);
  revalidatePath(`/teacher/courses/${courseId}/contents`);
}
