import { createCourseAction } from "@/actions/course-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { CourseForm } from "@/components/forms/course-form";
import { getAllCategories } from "@/lib/db/queries/categories";
import { getTeacherOptions } from "@/lib/db/queries/users";

export const metadata = { title: "Buat Course | Admin KARÉLLE" };

export default async function AdminNewCoursePage() {
  const [categories, teachers] = await Promise.all([getAllCategories(), getTeacherOptions()]);
  return (
    <>
      <PageHeader eyebrow="Course Management" title="Buat course" description="Sebagai Admin, Anda memilih Teacher pengajar course ini." />
      <div className="max-w-3xl rounded-xl border bg-card p-6 shadow-xs">
        <CourseForm action={createCourseAction} categories={categories} teachers={teachers} cancelHref="/admin/courses" />
      </div>
    </>
  );
}
