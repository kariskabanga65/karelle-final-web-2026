import { createCourseAction } from "@/actions/course-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { CourseForm } from "@/components/forms/course-form";
import { getAllCategories } from "@/lib/db/queries/categories";

export const metadata = { title: "Buat Course | Teacher KARÉLLE" };

export default async function TeacherNewCoursePage() {
  const categories = await getAllCategories();
  return (
    <>
      <PageHeader eyebrow="Course Management" title="Buat course" description="Course otomatis tercatat atas nama Anda sebagai Teacher." />
      <div className="max-w-3xl rounded-xl border bg-card p-6 shadow-xs">
        <CourseForm action={createCourseAction} categories={categories} cancelHref="/teacher/courses" />
      </div>
    </>
  );
}
