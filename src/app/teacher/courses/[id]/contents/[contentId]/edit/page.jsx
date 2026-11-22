import { notFound } from "next/navigation";
import { updateLessonAction } from "@/actions/lesson-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { LessonForm } from "@/components/forms/lesson-form";
import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { getLessonForEdit, getManageableCourse } from "@/lib/db/queries/lessons";
import { isUuid } from "@/lib/utils/slug";

export const metadata = { title: "Edit Materi | Teacher KARÉLLE" };

export default async function EditLessonPage({ params }) {
  const user = await requireRole(ROLES.TEACHER);
  const { id, contentId } = await params;
  const course = isUuid(id) ? await getManageableCourse(id, user.role === ROLES.ADMIN ? null : user.id) : null;
  const lesson = course && isUuid(contentId) ? await getLessonForEdit(contentId, course.id) : null;
  if (!course || !lesson) notFound();

  return (
    <>
      <PageHeader eyebrow={`${course.title} · Materi ${lesson.order_index}`} title="Edit materi" description={lesson.title} />
      <div className="max-w-4xl rounded-xl border bg-card p-6 shadow-xs">
        <LessonForm action={updateLessonAction.bind(null, course.id, lesson.id)} lesson={lesson} cancelHref={`/teacher/courses/${course.id}/contents`} />
      </div>
    </>
  );
}
