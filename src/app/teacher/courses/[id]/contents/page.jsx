import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Eye, FileText, MessageSquare, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteLessonAction, moveLessonAction } from "@/actions/lesson-actions";
import { LessonMoveButtons } from "@/components/dashboard/lesson-move-buttons";
import { PageHeader } from "@/components/dashboard/page-header";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { EmptyState } from "@/components/shared/empty-state";
import { FlashToast } from "@/components/shared/flash-toast";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { countEnrolledStudents, getManageableCourse, listLessons } from "@/lib/db/queries/lessons";
import { formatRelative } from "@/lib/utils/format";
import { isUuid } from "@/lib/utils/slug";

export const metadata = { title: "Kelola Materi | Teacher KARÉLLE" };

const FLASH = { created: "Materi baru ditambahkan.", updated: "Perubahan materi disimpan." };

export default async function CourseContentsPage({ params, searchParams }) {
  const user = await requireRole(ROLES.TEACHER);
  const { id } = await params;
  const { success } = await searchParams;
  const course = isUuid(id) ? await getManageableCourse(id, user.role === ROLES.ADMIN ? null : user.id) : null;
  if (!course) notFound();

  const [lessons, studentCount] = await Promise.all([listLessons(course.id), countEnrolledStudents(course.id)]);

  return (
    <>
      <FlashToast message={FLASH[success]} />
      <Link href="/teacher/courses" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Kembali ke Course saya
      </Link>
      <PageHeader eyebrow="Content Management" title={course.title} description={`${lessons.length} materi · ${studentCount} student terdaftar. Urutan materi menentukan alur belajar student.`}>
        <Button asChild variant="outline"><Link href={`/courses/${course.slug}`}><Eye /> Lihat halaman</Link></Button>
        <Button asChild variant="outline"><Link href={`/teacher/courses/${course.id}/edit`}><Pencil /> Edit info course</Link></Button>
        <Button asChild><Link href={`/teacher/courses/${course.id}/contents/new`}><Plus /> Tambah materi</Link></Button>
      </PageHeader>

      {lessons.length > 0 ? (
        <ol className="space-y-3" aria-label="Daftar materi">
          {lessons.map((lesson, index) => (
            <li key={lesson.id} className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-xs sm:gap-4 sm:p-5">
              <LessonMoveButtons
                moveUp={moveLessonAction.bind(null, course.id, lesson.id, "up")}
                moveDown={moveLessonAction.bind(null, course.id, lesson.id, "down")}
                isFirst={index === 0}
                isLast={index === lessons.length - 1}
                title={lesson.title}
              />
              <span className="font-display text-3xl leading-none text-muted-foreground tabular-nums sm:w-12" aria-hidden>
                {String(lesson.order_index).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <h2 className="font-display text-xl leading-tight">
                  <span className="sr-only">Materi {lesson.order_index}: </span>
                  {lesson.title}
                </h2>
                <p className="line-clamp-2 text-sm text-muted-foreground">{lesson.excerpt}</p>
                <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><CheckCircle2 className="size-3.5" /> {lesson.completed_count}/{studentCount} student selesai</span>
                  <Link href={`/teacher/courses/${course.id}/contents/${lesson.id}/discussion`} className="inline-flex items-center gap-1 underline-offset-4 hover:text-foreground hover:underline">
                    <MessageSquare className="size-3.5" /> {lesson.comment_count} diskusi
                  </Link>
                  <span>Diubah {formatRelative(lesson.updated_at)}</span>
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/teacher/courses/${course.id}/contents/${lesson.id}/edit`}><Pencil /> Edit</Link>
                </Button>
                <ConfirmActionButton
                  action={deleteLessonAction.bind(null, course.id, lesson.id)}
                  title="Hapus materi?"
                  description={`"${lesson.title}" beserta ${lesson.comment_count} diskusinya akan dihapus permanen. Progress student dihitung ulang otomatis.`}
                  triggerClassName="text-destructive hover:text-destructive"
                >
                  <Trash2 /> Hapus
                </ConfirmActionButton>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState icon={FileText} title="Belum ada materi" description="Tambahkan materi pertama. Student baru bisa belajar setelah course memiliki materi.">
          <Button asChild><Link href={`/teacher/courses/${course.id}/contents/new`}><Plus /> Tambah materi</Link></Button>
        </EmptyState>
      )}
    </>
  );
}
