import Link from "next/link";
import { ArrowLeft, CalendarClock, Eye } from "lucide-react";
import { LessonOutline } from "@/components/learning/lesson-outline";
import { MobileOutline } from "@/components/learning/mobile-outline";
import { Logo } from "@/components/layout/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { getLessonOutline } from "@/lib/db/queries/learning";
import { getLearnerContext } from "@/lib/learning/access";
import { formatDate, formatPercent, getInitials } from "@/lib/utils/format";

export default async function LearnLayout({ children, params }) {
  const user = await requireRole(ROLES.STUDENT);
  const { courseId } = await params;
  const { course, enrollment, preview } = await getLearnerContext(user.id, user.role, courseId);
  const lessons = await getLessonOutline(course.id, enrollment?.id ?? null);
  const completed = lessons.filter((lesson) => lesson.completed).length;
  const percent = enrollment ? Number(enrollment.progress_percent) : 0;
  const locked = Boolean(course.not_started) && !preview;
  const progressLabel = preview ? "Mode pratinjau Admin" : `${completed}/${lessons.length} materi selesai · ${formatPercent(percent)}`;
  const backHref = preview ? "/admin/courses" : "/student/courses";

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-80 shrink-0 flex-col bg-ink text-white lg:flex">
        <div className="space-y-6 border-b border-white/10 px-6 py-6">
          <Logo />
          <Link href={backHref} className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
            <ArrowLeft className="size-4" /> {preview ? "Kembali ke Courses" : "Kelas Saya"}
          </Link>
          <div className="space-y-3">
            <h1 className="font-display text-3xl leading-tight">{course.title}</h1>
            <div className="flex items-center gap-2.5 text-sm text-white/70">
              <Avatar className="size-7">
                {course.teacher_image && <AvatarImage src={course.teacher_image} alt="" className="grayscale" />}
                <AvatarFallback className="bg-white text-[0.6rem] text-ink">{getInitials(course.teacher_name)}</AvatarFallback>
              </Avatar>
              {course.teacher_name}
            </div>
          </div>
          {preview ? (
            <p className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs"><Eye className="size-4" /> Mode pratinjau Admin</p>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-white/70">
                <span>{completed}/{lessons.length} materi selesai</span>
                <span className="font-medium text-white">{formatPercent(percent)}</span>
              </div>
              <Progress value={percent} aria-label="Progress course" className="bg-white/15 [&>[data-slot=progress-indicator]]:bg-white" />
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <LessonOutline courseId={course.id} lessons={lessons} locked={locked} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 bg-ink px-4 text-white lg:hidden">
          <Link href={backHref} className="inline-flex min-w-0 items-center gap-2 text-sm">
            <ArrowLeft className="size-4 shrink-0" /> <span className="truncate">{course.title}</span>
          </Link>
          <MobileOutline courseId={course.id} courseTitle={course.title} lessons={lessons} locked={locked} progressLabel={progressLabel} />
        </header>
        {!preview && (
          <div className="border-b bg-card px-4 py-2 lg:hidden">
            <Progress value={percent} aria-label="Progress course" />
            <p className="mt-1 text-xs text-muted-foreground">{progressLabel}</p>
          </div>
        )}
        {locked && (
          <p role="status" className="flex items-center gap-2 border-b bg-secondary px-6 py-3 text-sm">
            <CalendarClock className="size-4" /> Kelas dimulai pada {formatDate(course.start_date)}. Materi dapat dibuka mulai tanggal tersebut.
          </p>
        )}
        <main id="main-content" className="flex-1 px-4 py-8 sm:px-8 lg:px-14 lg:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
