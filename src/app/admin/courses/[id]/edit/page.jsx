import { notFound } from "next/navigation";
import { updateCourseAction } from "@/actions/course-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { CourseForm } from "@/components/forms/course-form";
import { getAllCategories } from "@/lib/db/queries/categories";
import { getCourseForEdit } from "@/lib/db/queries/manage-courses";
import { getTeacherOptions } from "@/lib/db/queries/users";
import { isUuid } from "@/lib/utils/slug";

export const metadata = { title: "Edit Course | Admin KARÉLLE" };

export default async function AdminEditCoursePage({ params }) {
  const { id } = await params;
  const course = isUuid(id) ? await getCourseForEdit(id) : null;
  if (!course) notFound();
  const [categories, teachers] = await Promise.all([getAllCategories(), getTeacherOptions()]);

  return (
    <>
      <PageHeader eyebrow="Course Management" title="Edit course" description={course.title} />
      <div className="max-w-3xl rounded-xl border bg-card p-6 shadow-xs">
        <CourseForm action={updateCourseAction.bind(null, course.id)} course={course} categories={categories} teachers={teachers} cancelHref="/admin/courses" />
      </div>
    </>
  );
}
