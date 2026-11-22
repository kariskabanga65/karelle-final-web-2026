"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { withTransaction } from "@/lib/db";
import { getDbErrorMessage } from "@/lib/db/errors";
import { actionError, actionSuccess } from "@/lib/utils/action-result";

// z.guid(): format UUID umum (8-4-4-4-12) seperti yang diterima PostgreSQL.
const courseIdSchema = z.guid({ error: "Course tidak valid." });

/**
 * Student mengikuti sebuah course.
 * - Wajib login sebagai Student (Guest, Teacher, dan Admin ditolak).
 * - UNIQUE(student_id, course_id) di database mencegah enroll ganda.
 * - Teacher pemilik course mendapat notifikasi.
 */
export async function enrollCourseAction(courseId) {
  const user = await getCurrentUser();
  if (!user) return actionError("Silakan login sebagai Student untuk mengikuti course.");
  if (user.role !== ROLES.STUDENT) {
    return actionError("Hanya akun Student yang dapat mengikuti course.");
  }

  const parsed = courseIdSchema.safeParse(courseId);
  if (!parsed.success) return actionError("Course tidak valid.");

  try {
    const result = await withTransaction(async (client) => {
      const { rows } = await client.query(
        `SELECT id, title, teacher_id FROM courses WHERE id = $1`,
        [parsed.data],
      );
      const course = rows[0];
      if (!course) return { notFound: true };

      const inserted = await client.query(
        `INSERT INTO enrollments (student_id, course_id)
         VALUES ($1, $2)
         ON CONFLICT (student_id, course_id) DO NOTHING
         RETURNING id`,
        [user.id, course.id],
      );
      if (inserted.rowCount === 0) return { alreadyEnrolled: true, course };

      await client.query(
        `INSERT INTO notifications (user_id, type, title, message, link)
         VALUES ($1, 'new_enrollment', 'Student baru bergabung', $2, '/teacher')`,
        [course.teacher_id, `${user.name} mengikuti course ${course.title}.`],
      );
      return { course };
    });

    if (result.notFound) return actionError("Course tidak ditemukan.");
    if (result.alreadyEnrolled) return actionError("Anda sudah mengikuti course ini.");

    revalidatePath("/courses");
    revalidatePath("/");
    return actionSuccess(`Berhasil bergabung di "${result.course.title}". Selamat belajar!`, {
      courseId: result.course.id,
    });
  } catch (error) {
    console.error("[enrollment]", error);
    return actionError(getDbErrorMessage(error, "Gagal mengikuti course. Coba lagi."));
  }
}
