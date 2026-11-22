"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authorizeAction } from "@/lib/auth/action-guard";
import { ROLES } from "@/lib/auth/roles";
import { queryOne, withTransaction } from "@/lib/db";
import { getDbErrorMessage } from "@/lib/db/errors";
import { z } from "zod";
import { actionError, actionSuccess, formDataToObject } from "@/lib/utils/action-result";
import { htmlToText, sanitizeLessonHtml } from "@/lib/utils/sanitize";
import { isUuid } from "@/lib/utils/slug";
import { LESSON_MIN_TEXT, lessonSchema } from "@/lib/validations/lesson";

export async function createLessonAction(courseId, _prevState, formData) {
  const { user, error } = await authorizeAction([ROLES.TEACHER]);
  if (error) return error;

  const course = await assertCourseOwner(user, courseId);
  if (!course) return actionError("Course tidak ditemukan atau bukan milik Anda.");

  const input = formDataToObject(formData);
  const parsed = parseLesson(input);
  if (parsed.error) return parsed.error;

  try {
    await withTransaction(async (client) => {
      await client.query(`SELECT id FROM courses WHERE id = $1 FOR UPDATE`, [course.id]);
      const { rows } = await client.query(
        `SELECT COALESCE(MAX(order_index), 0) + 1 AS next FROM course_contents WHERE course_id = $1`,
        [course.id],
      );
      await client.query(
        `INSERT INTO course_contents (course_id, title, content, order_index) VALUES ($1, $2, $3, $4)`,
        [course.id, parsed.data.title, parsed.data.content, rows[0].next],
      );
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message, link)
         SELECT e.student_id, 'system', 'Materi baru', $2, $3
           FROM enrollments e WHERE e.course_id = $1`,
        [course.id, `Materi "${parsed.data.title}" ditambahkan di ${course.title}.`, `/student/learn/${course.id}`],
      );
    });
  } catch (err) {
    return actionError(getDbErrorMessage(err, "Gagal menambahkan materi."), {}, input);
  }

  revalidateLessons(course);
  redirect(`/teacher/courses/${course.id}/contents?success=created`);
}

export async function updateLessonAction(courseId, lessonId, _prevState, formData) {
  const { user, error } = await authorizeAction([ROLES.TEACHER]);
  if (error) return error;

  const course = await assertCourseOwner(user, courseId);
  if (!course || !isUuid(lessonId)) return actionError("Materi tidak ditemukan atau bukan milik Anda.");

  const input = formDataToObject(formData);
  const parsed = parseLesson(input);
  if (parsed.error) return parsed.error;

  try {
    const updated = await queryOne(
      `UPDATE course_contents SET title = $1, content = $2
        WHERE id = $3 AND course_id = $4
        RETURNING id`,
      [parsed.data.title, parsed.data.content, lessonId, course.id],
    );
    if (!updated) return actionError("Materi tidak ditemukan atau bukan milik Anda.", {}, input);
  } catch (err) {
    return actionError(getDbErrorMessage(err, "Gagal menyimpan materi."), {}, input);
  }

  revalidateLessons(course);
  redirect(`/teacher/courses/${course.id}/contents?success=updated`);
}

export async function deleteLessonAction(courseId, lessonId) {
  const { user, error } = await authorizeAction([ROLES.TEACHER]);
  if (error) return error;

  const course = await assertCourseOwner(user, courseId);
  if (!course || !isUuid(lessonId)) return actionError("Materi tidak ditemukan atau bukan milik Anda.");

  try {
    const title = await withTransaction(async (client) => {
      await client.query(`SELECT id FROM courses WHERE id = $1 FOR UPDATE`, [course.id]);
      const { rows } = await client.query(
        `DELETE FROM course_contents WHERE id = $1 AND course_id = $2 RETURNING title`,
        [lessonId, course.id],
      );
      if (rows.length === 0) return null;
      await renumberLessons(client, course.id);
      return rows[0].title;
    });
    if (!title) return actionError("Materi tidak ditemukan atau bukan milik Anda.");
    revalidateLessons(course);
    return actionSuccess(`Materi "${title}" dihapus.`);
  } catch (err) {
    return actionError(getDbErrorMessage(err, "Gagal menghapus materi."));
  }
}

export async function moveLessonAction(courseId, lessonId, direction) {
  const { user, error } = await authorizeAction([ROLES.TEACHER]);
  if (error) return error;

  const course = await assertCourseOwner(user, courseId);
  if (!course || !isUuid(lessonId) || !["up", "down"].includes(direction)) {
    return actionError("Materi tidak ditemukan atau bukan milik Anda.");
  }

  try {
    const moved = await withTransaction(async (client) => {
      await client.query(`SELECT id FROM courses WHERE id = $1 FOR UPDATE`, [course.id]);
      const { rows: current } = await client.query(
        `SELECT id, order_index FROM course_contents WHERE id = $1 AND course_id = $2`,
        [lessonId, course.id],
      );
      if (current.length === 0) return false;

      const { rows: neighbor } = await client.query(
        direction === "up"
          ? `SELECT id, order_index FROM course_contents
              WHERE course_id = $1 AND order_index < $2 ORDER BY order_index DESC LIMIT 1`
          : `SELECT id, order_index FROM course_contents
              WHERE course_id = $1 AND order_index > $2 ORDER BY order_index ASC LIMIT 1`,
        [course.id, current[0].order_index],
      );
      if (neighbor.length === 0) return true; 
      await client.query(`SET CONSTRAINTS course_contents_course_order_key DEFERRED`);
      await client.query(
        `UPDATE course_contents
            SET order_index = CASE id WHEN $1::uuid THEN $3::int WHEN $2::uuid THEN $4::int END
          WHERE id IN ($1::uuid, $2::uuid) AND course_id = $5`,
        [current[0].id, neighbor[0].id, neighbor[0].order_index, current[0].order_index, course.id],
      );
      return true;
    });
    if (!moved) return actionError("Materi tidak ditemukan atau bukan milik Anda.");
    revalidateLessons(course);
    return actionSuccess("Urutan materi diperbarui.");
  } catch (err) {
    return actionError(getDbErrorMessage(err, "Gagal mengubah urutan materi."));
  }
}

async function assertCourseOwner(user, courseId) {
  if (!isUuid(courseId)) return null;
  return queryOne(
    `SELECT id, title, slug FROM courses
      WHERE id = $1 AND ($2::text IS NULL OR teacher_id = $2)`,
    [courseId, user.role === ROLES.ADMIN ? null : user.id],
  );
}

function parseLesson(input) {
  const parsed = lessonSchema.safeParse(input);
  const fieldErrors = parsed.success ? {} : { ...z.flattenError(parsed.error).fieldErrors };

  const content = sanitizeLessonHtml(typeof input.content === "string" ? input.content : "");
  if (!fieldErrors.content && htmlToText(content).length < LESSON_MIN_TEXT) {
    fieldErrors.content = [`Isi materi minimal ${LESSON_MIN_TEXT} karakter.`];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: actionError("Periksa kembali data yang Anda isi.", fieldErrors, input) };
  }
  return { data: { title: parsed.data.title, content } };
}

async function renumberLessons(client, courseId) {
  await client.query(`SET CONSTRAINTS course_contents_course_order_key DEFERRED`);
  await client.query(
    `UPDATE course_contents cc
        SET order_index = ordered.position
       FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY order_index)::int AS position
               FROM course_contents WHERE course_id = $1) ordered
      WHERE cc.id = ordered.id AND cc.order_index <> ordered.position`,
    [courseId],
  );
}

function revalidateLessons(course) {
  revalidatePath(`/teacher/courses/${course.id}/contents`);
  revalidatePath("/teacher/courses");
  revalidatePath("/teacher");
  revalidatePath(`/courses/${course.slug}`);
  revalidatePath("/courses");
}
