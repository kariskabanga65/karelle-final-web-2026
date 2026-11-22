import { notFound } from "next/navigation";
import { createLessonAction } from "@/actions/lesson-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { LessonForm } from "@/components/forms/lesson-form";
import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { getManageableCourse } from "@/lib/db/queries/lessons";
import { isUuid } from "@/lib/utils/slug";

export const metadata = { title: "Tambah Materi | Teacher KARÉLLE" };

export default async function NewLessonPage({ params }) {
  const user = await requireRole(ROLES.TEACHER);
  const { id } = await params;
  const course = isUuid(id) ? await getManageableCourse(id, user.role === ROLES.ADMIN ? null : user.id) : null;
  if (!course) notFound();

  return (
    <>
      <PageHeader eyebrow={course.title} title="Tambah materi" description="Materi baru otomatis ditempatkan di urutan paling akhir. Urutannya bisa diubah nanti." />
      <div className="max-w-4xl rounded-xl border bg-card p-6 shadow-xs">
        <LessonForm action={createLessonAction.bind(null, course.id)} cancelHref={`/teacher/courses/${course.id}/contents`} />
      </div>
    </>
  );
}
