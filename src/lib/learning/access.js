import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { ROLES } from "@/lib/auth/roles";
import { getEnrollment } from "@/lib/db/queries/enrollments";
import { getLearningCourse } from "@/lib/db/queries/learning";
import { isUuid } from "@/lib/utils/slug";

/**
 * Hak akses ruang belajar untuk satu course.
 * - Student: wajib mengikuti course; jika belum -> diarahkan ke halaman detail course.
 * - Admin  : mode pratinjau (boleh membaca, tidak bisa menandai selesai).
 * cache() -> dihitung sekali per request walau dipanggil di layout & page
 * (argumen berupa nilai primitif agar cache cocok).
 */
export const getLearnerContext = cache(async (userId, role, courseId) => {
  if (!isUuid(courseId)) notFound();
  const course = await getLearningCourse(courseId);
  if (!course) notFound();

  if (role === ROLES.ADMIN) return { course, enrollment: null, preview: true };

  const enrollment = await getEnrollment(userId, course.id);
  if (!enrollment) redirect(`/courses/${course.slug}`);
  return { course, enrollment, preview: false };
});
