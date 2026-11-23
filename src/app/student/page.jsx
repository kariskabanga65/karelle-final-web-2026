import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Award, BookOpen, CheckCircle2, Compass, TrendingUp } from "lucide-react";
import { CourseCard } from "@/components/course/course-card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { NotificationItem } from "@/components/notifications/notification-item";
import { EmptyState } from "@/components/shared/empty-state";
import { FlashToast } from "@/components/shared/flash-toast";
import { EnrolledCourseCard } from "@/components/student/enrolled-course-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { requireRole } from "@/lib/auth/session";
import { redirectTeacherWithoutLearning } from "@/lib/learning/access";
import { LEARNER_ROLES, ROLES } from "@/lib/auth/roles";
import { listNotifications } from "@/lib/db/queries/notifications";
import { getRecommendedCourses, getStudentStats, listStudentCourses } from "@/lib/db/queries/student";
import { formatPercent } from "@/lib/utils/format";

export const metadata = { title: "Student Dashboard | KARÉLLE" };

export default async function StudentDashboardPage({ searchParams }) {
  const user = await requireRole(...LEARNER_ROLES);
    if (user.role === ROLES.TEACHER) {
    await redirectTeacherWithoutLearning(user);
    redirect("/student/courses");
  }
  const { welcome } = await searchParams;
  const [stats, courses, notifications, recommended] = await Promise.all([
    getStudentStats(user.id),
    listStudentCourses(user.id),
    listNotifications(user.id, { limit: 5 }),
    getRecommendedCourses(user.id, 3),
  ]);
  const current = courses.find((course) => course.status === "active" && course.total_lessons > 0 && !course.not_started);
  const viewer = { id: user.id, role: user.role };

  return (
    <DashboardShell user={user}>
      <FlashToast message={welcome ? `Selamat datang di KARÉLLE, ${user.name.split(" ")[0]}!` : null} />
      <PageHeader eyebrow="Student Dashboard" title={`Halo, ${user.name.split(" ")[0]}`} description="Lanjutkan perjalanan modeling Anda hari ini.">
        <Button asChild variant="outline"><Link href="/courses"><Compass /> Jelajahi course</Link></Button>
      </PageHeader>

      {current && (
        <section aria-labelledby="continue-title" className="relative overflow-hidden rounded-2xl bg-ink p-6 text-white sm:p-8">
          <div className="relative grid gap-6 md:grid-cols-[1fr_16rem] md:items-end">
            <div className="space-y-3">
              <p className="eyebrow text-white/70">Lanjutkan belajar</p>
              <h2 id="continue-title" className="font-display text-3xl sm:text-4xl">{current.title}</h2>
              <p className="text-sm text-white/70">
                {current.next_lesson_title ? <>Materi berikutnya: <span className="text-white">{current.next_lesson_title}</span></> : "Semua materi sudah dibuka."}
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-white/70">
                <span>{current.completed_lessons}/{current.total_lessons} materi</span>
                <span className="font-medium text-white">{formatPercent(current.progress_percent)}</span>
              </div>
              <Progress value={Number(current.progress_percent)} aria-label={`Progress ${current.title}`} className="bg-white/15 [&>[data-slot=progress-indicator]]:bg-white" />
              <Button asChild variant="light" className="w-full">
                <Link href={`/student/learn/${current.course_id}`}>Lanjutkan <ArrowRight /></Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <section aria-label="Statistik" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Kelas diikuti" value={stats.total_courses} icon={BookOpen} href="/student/courses" highlight />
        <StatCard label="Materi selesai" value={stats.completed_lessons} icon={CheckCircle2} href="/student/courses" />
        <StatCard label="Rata-rata progress" value={`${stats.average_progress}%`} icon={TrendingUp} href="/student/courses" />
        <StatCard label="Kelas selesai" value={stats.completed_courses} icon={Award} href="/student/courses?status=completed" />
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <section aria-labelledby="my-courses-title" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="my-courses-title" className="font-display text-2xl">Kelas saya</h2>
            {courses.length > 0 && <Link href="/student/courses" className="text-sm font-medium underline-offset-4 hover:underline">Lihat semua</Link>}
          </div>
          {courses.length > 0 ? (
            <div className="space-y-4">
              {courses.slice(0, 3).map((course) => <EnrolledCourseCard key={course.enrollment_id} course={course} />)}
            </div>
          ) : (
            <EmptyState icon={BookOpen} title="Belum mengikuti kelas" description="Pilih kelas pertama Anda dari katalog dan mulai belajar.">
              <Button asChild><Link href="/courses">Lihat katalog</Link></Button>
            </EmptyState>
          )}
        </section>

        <aside aria-labelledby="notif-title" className="rounded-xl border bg-card p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="notif-title" className="font-display text-2xl">Notifikasi</h2>
            <Link href="/notifications" className="text-sm font-medium underline-offset-4 hover:underline">Semua</Link>
          </div>
          {notifications.length > 0 ? (
            <div className="space-y-1">
              {notifications.map((item) => <NotificationItem key={item.id} notification={item} compact />)}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">Belum ada notifikasi.</p>
          )}
        </aside>
      </div>

      {recommended.length > 0 && (
        <section aria-labelledby="recommend-title" className="space-y-4">
          <h2 id="recommend-title" className="font-display text-2xl">Rekomendasi untuk Anda</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recommended.map((course) => <CourseCard key={course.id} course={course} viewer={viewer} />)}
          </div>
        </section>
      )}
    </DashboardShell>
  );
}
