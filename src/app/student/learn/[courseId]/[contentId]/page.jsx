import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarClock, Lock } from "lucide-react";
import { Discussion } from "@/components/discussion/discussion";
import { MarkDoneButton } from "@/components/learning/mark-done-button";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { getLesson, getLessonOutline, rememberLastLesson } from "@/lib/db/queries/learning";
import { getLearnerContext } from "@/lib/learning/access";
import { formatDate } from "@/lib/utils/format";
import { sanitizeLessonHtml } from "@/lib/utils/sanitize";
import { isUuid } from "@/lib/utils/slug";

export const metadata = { title: "Materi | KARÉLLE" };

export default async function LessonPage({ params }) {
  const user = await requireRole(ROLES.STUDENT);
  const { courseId, contentId } = await params;
  const { course, enrollment, preview } = await getLearnerContext(user.id, user.role, courseId);
  if (!isUuid(contentId)) notFound();

  const [lesson, outline] = await Promise.all([getLesson(course.id, contentId), getLessonOutline(course.id, enrollment?.id ?? null)]);
  if (!lesson) notFound();

  const index = outline.findIndex((item) => item.id === lesson.id);
  const previous = outline[index - 1] ?? null;
  const next = outline[index + 1] ?? null;
  const completed = Boolean(outline[index]?.completed);
  const locked = Boolean(course.not_started) && !preview;

  if (enrollment && !locked) await rememberLastLesson(enrollment.id, lesson.id);

  return (
    <div className="mx-auto max-w-3xl space-y-12">
      <article className="space-y-8">
        <header className="space-y-3 border-b pb-6">
          <p className="eyebrow">Materi {lesson.order_index} dari {outline.length}</p>
          <h1 className="display-title text-4xl sm:text-5xl">{lesson.title}</h1>
        </header>

        {locked ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-14 text-center">
            <Lock className="size-7" aria-hidden />
            <p className="font-display text-2xl">Materi belum dapat dibuka</p>
            <p className="max-w-md text-sm text-muted-foreground">Kelas ini dimulai pada {formatDate(course.start_date)}.</p>
          </div>
        ) : (
          <div className="prose-karelle" dangerouslySetInnerHTML={{ __html: sanitizeLessonHtml(lesson.content) }} />
        )}

        {!locked && (
          <div className="flex flex-col gap-5 rounded-xl border bg-card p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            {preview ? (
              <p className="text-sm text-muted-foreground">Mode pratinjau: tombol Tandai Selesai hanya tersedia untuk Student.</p>
            ) : course.ended ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarClock className="size-4" /> Periode kelas berakhir {formatDate(course.end_date)}. Progress tidak dapat diubah.
              </p>
            ) : (
              <MarkDoneButton
                courseId={course.id}
                contentId={lesson.id}
                completed={completed}
                nextHref={next ? `/student/learn/${course.id}/${next.id}` : null}
              />
            )}
          </div>
        )}

        <nav aria-label="Navigasi materi" className="grid gap-3 sm:grid-cols-2">
          {previous ? (
            <Link href={`/student/learn/${course.id}/${previous.id}`} className="group rounded-xl border p-4 transition-colors hover:bg-card">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><ArrowLeft className="size-3.5" /> Sebelumnya</span>
              <span className="mt-1 block font-medium">{previous.title}</span>
            </Link>
          ) : <span />}
          {next && (
            <Link href={`/student/learn/${course.id}/${next.id}`} className="group rounded-xl border p-4 text-right transition-colors hover:bg-card">
              <span className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">Berikutnya <ArrowRight className="size-3.5" /></span>
              <span className="mt-1 block font-medium">{next.title}</span>
            </Link>
          )}
        </nav>
        {!next && !preview && enrollment?.status === "completed" && (
          <div className="rounded-xl bg-ink p-6 text-white">
            <p className="eyebrow text-white/70">Course selesai</p>
            <p className="mt-2 font-display text-3xl">Selamat, Anda menyelesaikan {course.title}!</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="light"><Link href="/student/certificates">Lihat sertifikat</Link></Button>
              <Button asChild variant="outline-light"><Link href="/student/courses">Kelas Saya</Link></Button>
            </div>
          </div>
        )}
      </article>

      {!locked && <Discussion contentId={lesson.id} viewer={user} courseTeacherId={course.teacher_id} />}
    </div>
  );
}
