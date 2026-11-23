"use server";

import { revalidatePath } from "next/cache";
import { authorizeAction } from "@/lib/auth/action-guard";
import { issueCertificate } from "@/lib/certificates/issue";
import { ROLES } from "@/lib/auth/roles";
import { withTransaction } from "@/lib/db";
import { getDbErrorMessage } from "@/lib/db/errors";
import { actionError, actionSuccess } from "@/lib/utils/action-result";
import { isUuid } from "@/lib/utils/slug";


export async function toggleLessonDoneAction(courseId, contentId, done) {
  const { user, error } = await authorizeAction([ROLES.STUDENT]);
  if (error) return error;
  if (user.role !== ROLES.STUDENT) return actionError("Mode pratinjau: hanya Student yang dapat menandai materi.");
  if (!isUuid(courseId) || !isUuid(contentId)) return actionError("Materi tidak ditemukan.");

  try {
    const result = await withTransaction(async (client) => {
      const { rows } = await client.query(
        `SELECT e.id, e.status,
                (c.start_date IS NOT NULL AND c.start_date > CURRENT_DATE) AS not_started,
                (c.end_date IS NOT NULL AND c.end_date < CURRENT_DATE) AS ended,
                EXISTS (SELECT 1 FROM course_contents cc WHERE cc.id = $3 AND cc.course_id = c.id) AS lesson_exists
           FROM enrollments e
           JOIN courses c ON c.id = e.course_id
          WHERE e.student_id = $1 AND e.course_id = $2
          FOR UPDATE OF e`,
        [user.id, courseId, contentId],
      );
      const enrollment = rows[0];
      if (!enrollment) return { error: "Anda belum mengikuti course ini." };
      if (!enrollment.lesson_exists) return { error: "Materi tidak ditemukan." };
      if (enrollment.not_started) return { error: "Kelas belum dimulai." };
      if (enrollment.ended) return { error: "Periode kelas sudah berakhir. Progress tidak dapat diubah." };

      if (done) {
        await client.query(
          `INSERT INTO lesson_progress (enrollment_id, content_id, course_id)
           VALUES ($1, $2, $3)
           ON CONFLICT (enrollment_id, content_id) DO NOTHING`,
          [enrollment.id, contentId, courseId],
        );
      } else {
        await client.query(`DELETE FROM lesson_progress WHERE enrollment_id = $1 AND content_id = $2`, [enrollment.id, contentId]);
      }
      await client.query(`UPDATE enrollments SET last_content_id = $2 WHERE id = $1`, [enrollment.id, contentId]);

      
      const { rows: updated } = await client.query(
        `SELECT progress_percent, status FROM enrollments WHERE id = $1`,
        [enrollment.id],
      );
      
      const certificate =
        updated[0].status === "completed" ? await issueCertificate(client, { studentId: user.id, courseId }) : null;

      return {
        progress: Number(updated[0].progress_percent),
        justCompleted: enrollment.status !== "completed" && updated[0].status === "completed",
        certificateId: certificate?.created ? certificate.id : null,
      };
    });

    if (result.error) return actionError(result.error);
    revalidatePath(`/student/learn/${courseId}`, "layout");
    revalidatePath("/student");
    revalidatePath("/student/courses");
    revalidatePath("/student/certificates");
    return actionSuccess(
      result.justCompleted ? "Selamat! Anda menyelesaikan seluruh materi course ini." : done ? "Materi ditandai selesai." : "Tanda selesai dibatalkan.",
      { progress: result.progress, justCompleted: result.justCompleted, certificateId: result.certificateId },
    );
  } catch (err) {
    return actionError(getDbErrorMessage(err, "Gagal memperbarui progress."));
  }
}
