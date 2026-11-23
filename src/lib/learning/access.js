import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { ROLES } from "@/lib/auth/roles";
import { countEnrollments, getEnrollment } from "@/lib/db/queries/enrollments";
import { getLearningCourse } from "@/lib/db/queries/learning";
import { isUuid } from "@/lib/utils/slug";


export const getLearnerContext = cache(async (userId, role, courseId) => {
  if (!isUuid(courseId)) notFound();
  const course = await getLearningCourse(courseId);
  if (!course) notFound();

  if (role === ROLES.ADMIN) return { course, enrollment: null, preview: true };

  const enrollment = await getEnrollment(userId, course.id);
  if (!enrollment) redirect(`/courses/${course.slug}`);
  return { course, enrollment, preview: false };
});


export async function redirectTeacherWithoutLearning(user) {
  if (user.role === ROLES.TEACHER && (await countEnrollments(user.id)) === 0) redirect("/teacher");
}
