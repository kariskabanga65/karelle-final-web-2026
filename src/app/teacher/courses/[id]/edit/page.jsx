import { notFound } from "next/navigation";
import { updateCourseAction } from "@/actions/course-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { CourseForm } from "@/components/forms/course-form";
import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { getAllCategories } from "@/lib/db/queries/categories";
import { getCourseForEdit } from "@/lib/db/queries/manage-courses";
import { isUuid } from "@/lib/utils/slug";

export const metadata = { title: "Edit Course | Teacher KARÉLLE" };

export default async function TeacherEditCoursePage({ params }) {
  const user = await requireRole(ROLES.TEACHER);
  const { id } = await params;
  const course = isUuid(id) ? await getCourseForEdit(id) : null;
  if (!course || (user.role !== ROLES.ADMIN && course.teacher_id !== user.id)) notFound();
  const categories = await getAllCategories();

  return (
    <>
      <PageHeader eyebrow="Course Management" title="Edit course" description={course.title} />
      <div className="max-w-3xl rounded-xl border bg-card p-6 shadow-xs">
        <CourseForm action={updateCourseAction.bind(null, course.id)} course={course} categories={categories} cancelHref="/teacher/courses" />
      </div>
    </>
  );
}
