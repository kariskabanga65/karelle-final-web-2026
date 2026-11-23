import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Discussion } from "@/components/discussion/discussion";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { getLessonForEdit, getManageableCourse } from "@/lib/db/queries/lessons";
import { isUuid } from "@/lib/utils/slug";

export const metadata = { title: "Diskusi Materi | Teacher KARÉLLE" };

/** Teacher pemilik course (dan Admin) membaca & membalas diskusi satu materi. */
export default async function LessonDiscussionPage({ params }) {
  const user = await requireRole(ROLES.TEACHER);
  const { id, contentId } = await params;
  const course = isUuid(id) ? await getManageableCourse(id, user.role === ROLES.ADMIN ? null : user.id) : null;
  const lesson = course && isUuid(contentId) ? await getLessonForEdit(contentId, course.id) : null;
  if (!course || !lesson) notFound();

  return (
    <>
      <Link href={`/teacher/courses/${course.id}/contents`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Kembali ke daftar materi
      </Link>
      <PageHeader eyebrow={`${course.title} · Materi ${lesson.order_index}`} title={lesson.title} description="Jawab pertanyaan student. Student yang Anda balas akan mendapat notifikasi.">
        <Button asChild variant="outline"><Link href={`/teacher/courses/${course.id}/contents/${lesson.id}/edit`}><Pencil /> Edit materi</Link></Button>
      </PageHeader>
      <div className="max-w-3xl">
        <Discussion contentId={lesson.id} viewer={user} courseTeacherId={course.teacher_id} />
      </div>
    </>
  );
}
