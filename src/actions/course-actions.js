"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authorizeAction } from "@/lib/auth/action-guard";
import { ROLES } from "@/lib/auth/roles";
import { query, queryOne } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";
import { getDbErrorMessage } from "@/lib/db/errors";
import { actionError, actionSuccess, formDataToObject, validationError } from "@/lib/utils/action-result";
import { removeUpload } from "@/lib/uploads";
import { isUuid, slugify } from "@/lib/utils/slug";
import { courseSchema } from "@/lib/validations/course";

/**
 * Course Management untuk Admin DAN Teacher.
 * - Admin   : mengelola semua course dan memilih Teacher-nya.
 * - Teacher : teacher_id otomatis akun yang login; hanya bisa mengubah
 *             dan menghapus course miliknya (dicek di query SQL).
 */

export async function createCourseAction(_prevState, formData) {
  const { user, error } = await authorizeAction([ROLES.TEACHER]); // Admin otomatis lolos
  if (error) return error;

  const input = formDataToObject(formData);
  const parsed = courseSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error, input);

  const teacher = await resolveTeacher(user, parsed.data.teacherId, input);
  if (teacher.error) return teacher.error;

  const { title, description, categoryId, startDate, endDate, thumbnailUrl } = parsed.data;
  try {
    const created = await query(
      `INSERT INTO courses (title, slug, description, category_id, teacher_id, start_date, end_date, thumbnail_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id,
                 (SELECT name FROM categories WHERE id = $4) AS category,
                 (SELECT name FROM users WHERE id = $5) AS teacher`,
      [title, await uniqueSlug(title), description, categoryId, teacher.id, startDate, endDate, thumbnailUrl],
    );
    await logActivity({
      actor: user, action: "create", entityType: "course", entityId: created.rows[0].id, entityLabel: title,
      details: { kategori: created.rows[0].category, teacher: created.rows[0].teacher },
    });
  } catch (err) {
    return actionError(getDbErrorMessage(err, "Gagal membuat course."), {}, input);
  }

  revalidateCourses();
  redirect(`${basePath(user)}/courses?success=created`);
}

export async function updateCourseAction(courseId, _prevState, formData) {
  const { user, error } = await authorizeAction([ROLES.TEACHER]);
  if (error) return error;
  if (!isUuid(courseId)) return actionError("Course tidak valid.");

  const input = formDataToObject(formData);
  const parsed = courseSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error, input);

  const course = await queryOne(`SELECT id, title, slug, teacher_id, thumbnail_url FROM courses WHERE id = $1`, [courseId]);
  if (!course || !canManage(user, course)) {
    return actionError("Course tidak ditemukan atau bukan milik Anda.", {}, input);
  }

  const teacher = await resolveTeacher(user, parsed.data.teacherId || course.teacher_id, input);
  if (teacher.error) return teacher.error;

  const { title, description, categoryId, startDate, endDate, thumbnailUrl } = parsed.data;
  const slug = title === course.title ? course.slug : await uniqueSlug(title, courseId);

  try {
    await query(
      `UPDATE courses
          SET title = $1, slug = $2, description = $3, category_id = $4,
              teacher_id = $5, start_date = $6, end_date = $7, thumbnail_url = $10
        WHERE id = $8 AND ($9::text IS NULL OR teacher_id = $9)`,
      [title, slug, description, categoryId, teacher.id, startDate, endDate, courseId, ownerFilter(user), thumbnailUrl],
    );
  } catch (err) {
    return actionError(getDbErrorMessage(err, "Gagal menyimpan course."), {}, input);
  }
  // Thumbnail lama dihapus dari penyimpanan jika diganti/dihapus.
  if (course.thumbnail_url && course.thumbnail_url !== thumbnailUrl) await removeUpload(course.thumbnail_url);

  const changes = {};
  if (course.title !== title) changes.judul = { dari: course.title, menjadi: title };
  if (course.teacher_id !== teacher.id) {
    const names = await query(`SELECT id, name FROM users WHERE id = ANY($1::text[])`, [[course.teacher_id, teacher.id]]);
    const nameOf = (id) => names.rows.find((row) => row.id === id)?.name ?? id;
    changes.teacher = { dari: nameOf(course.teacher_id), menjadi: nameOf(teacher.id) };
  }
  await logActivity({ actor: user, action: "update", entityType: "course", entityId: courseId, entityLabel: title, details: changes });

  revalidateCourses();
  redirect(`${basePath(user)}/courses?success=updated`);
}

export async function deleteCourseAction(courseId) {
  const { user, error } = await authorizeAction([ROLES.TEACHER]);
  if (error) return error;
  if (!isUuid(courseId)) return actionError("Course tidak valid.");

  try {
    // Teacher hanya bisa menghapus course miliknya sendiri.
    // Salinan isi course disimpan ke Riwayat Aktivitas sebelum dihapus (cascade),
    // agar tetap bisa dicek walaupun datanya tidak bisa dipulihkan.
    const snapshot = await queryOne(
      `SELECT c.title, c.description, cat.name AS category, u.name AS teacher,
              (SELECT COUNT(*)::int FROM course_contents cc WHERE cc.course_id = c.id) AS lessons,
              (SELECT COUNT(*)::int FROM enrollments e WHERE e.course_id = c.id) AS students,
              (SELECT COALESCE(json_agg(cc.title ORDER BY cc.order_index), '[]'::json)
                 FROM course_contents cc WHERE cc.course_id = c.id) AS lesson_titles
         FROM courses c
         JOIN categories cat ON cat.id = c.category_id
         JOIN users u ON u.id = c.teacher_id
        WHERE c.id = $1 AND ($2::text IS NULL OR c.teacher_id = $2)`,
      [courseId, ownerFilter(user)],
    );
    const result = await query(
      `DELETE FROM courses
        WHERE id = $1 AND ($2::text IS NULL OR teacher_id = $2)
        RETURNING title, thumbnail_url`,
      [courseId, ownerFilter(user)],
    );
    if (result.rowCount === 0) return actionError("Course tidak ditemukan atau bukan milik Anda.");
    await logActivity({
      actor: user, action: "delete", entityType: "course", entityId: courseId, entityLabel: result.rows[0].title,
      details: snapshot
        ? {
            kategori: snapshot.category,
            teacher: snapshot.teacher,
            deskripsi: snapshot.description,
            jumlah_materi: snapshot.lessons,
            jumlah_student: snapshot.students,
            daftar_materi: snapshot.lesson_titles,
          }
        : {},
    });
    await removeUpload(result.rows[0].thumbnail_url);
    revalidateCourses();
    return actionSuccess(`Course "${result.rows[0].title}" dihapus.`);
  } catch (err) {
    return actionError(getDbErrorMessage(err, "Gagal menghapus course."));
  }
}

// ---------------------------------------------------------------
const isAdmin = (user) => user.role === ROLES.ADMIN;
const basePath = (user) => (isAdmin(user) ? "/admin" : "/teacher");
const ownerFilter = (user) => (isAdmin(user) ? null : user.id);
const canManage = (user, course) => isAdmin(user) || course.teacher_id === user.id;

/** Admin memilih Teacher dari form; Teacher selalu dirinya sendiri. */
async function resolveTeacher(user, requestedTeacherId, input) {
  if (!isAdmin(user)) return { id: user.id };
  const teacher = requestedTeacherId
    ? await queryOne(`SELECT id FROM users WHERE id = $1 AND role = 'teacher'`, [requestedTeacherId])
    : null;
  if (!teacher) {
    return { error: actionError("Periksa kembali data yang Anda isi.", { teacherId: ["Pilih Teacher yang valid."] }, input) };
  }
  return { id: teacher.id };
}

/** Slug unik: "judul", lalu "judul-2", "judul-3", dst. */
async function uniqueSlug(title, excludeId = null) {
  const base = slugify(title);
  let slug = base;
  for (let n = 2; ; n += 1) {
    const taken = await queryOne(
      `SELECT 1 FROM courses WHERE slug = $1 AND id IS DISTINCT FROM $2`,
      [slug, excludeId],
    );
    if (!taken) return slug;
    slug = `${base}-${n}`;
  }
}

function revalidateCourses() {
  revalidatePath("/admin/courses");
  revalidatePath("/teacher/courses");
  revalidatePath("/courses");
  revalidatePath("/");
}
