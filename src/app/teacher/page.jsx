import Link from "next/link";
import { Award, BookOpen, CheckCircle2, FileText, GraduationCap, MessageSquare, Plus, TrendingUp, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { getTeacherActivity, getTeacherCourseSummaries, getTeacherStats } from "@/lib/db/queries/teacher-dashboard";
import { formatRelative } from "@/lib/utils/format";

export const metadata = { title: "Teacher Dashboard | KARÉLLE" };

const ACTIVITY = {
  enroll: { icon: UserPlus, text: (a) => <><b>{a.actor}</b> mengikuti <b>{a.target}</b></> },
  lesson: { icon: CheckCircle2, text: (a) => <><b>{a.actor}</b> menyelesaikan materi <b>{a.target}</b></> },
  comment: { icon: MessageSquare, text: (a) => <><b>{a.actor}</b> berdiskusi di materi <b>{a.target}</b></> },
  completed: { icon: Award, text: (a) => <><b>{a.actor}</b> menyelesaikan course <b>{a.target}</b></> },
};

export default async function TeacherDashboardPage() {
  const user = await requireRole(ROLES.TEACHER);
  const teacherId = user.role === ROLES.ADMIN ? null : user.id;
  const [stats, courses, activity] = await Promise.all([
    getTeacherStats(teacherId),
    getTeacherCourseSummaries(teacherId),
    getTeacherActivity(teacherId, 8),
  ]);

  return (
    <>
      <PageHeader eyebrow="Teacher Dashboard" title={`Halo, ${user.name.split(" ")[0]}`} description="Pantau course, materi, dan perkembangan student Anda.">
        <Button asChild><Link href="/teacher/courses/new"><Plus /> Buat course</Link></Button>
      </PageHeader>

      <section aria-label="Statistik" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Course saya" value={stats.total_courses} icon={BookOpen} href="/teacher/courses" highlight />
        <StatCard label="Total materi" value={stats.total_lessons} icon={FileText} href="/teacher/courses" />
        <StatCard label="Student" value={stats.total_students} icon={GraduationCap} href="/teacher/students" />
        <StatCard label="Rata-rata progress" value={`${stats.average_progress}%`} icon={TrendingUp} href="/teacher/students" />
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <section aria-labelledby="courses-title" className="rounded-xl border bg-card p-6 shadow-xs">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 id="courses-title" className="font-display text-2xl">Course saya</h2>
            <Link href="/teacher/courses" className="text-sm font-medium underline-offset-4 hover:underline">Kelola semua</Link>
          </div>
          {courses.length > 0 ? (
            <ul className="divide-y">
              {courses.map((course) => (
                <li key={course.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-6">
                  <div className="min-w-0 flex-1 space-y-1">
                    <Badge variant="outline">{course.category_name}</Badge>
                    <p className="font-display text-xl leading-tight">{course.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.content_count} materi · {course.student_count} student · {course.completed_count} lulus
                    </p>
                  </div>
                  <div className="w-full space-y-1.5 sm:w-44">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Rata-rata progress</span>
                      <span className="font-medium text-foreground">{course.average_progress}%</span>
                    </div>
                    <Progress value={course.average_progress} aria-label={`Rata-rata progress ${course.title}`} />
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm"><Link href={`/teacher/courses/${course.id}/contents`}>Materi</Link></Button>
                    <Button asChild variant="ghost" size="sm"><Link href={`/teacher/students?course=${course.id}`}>Student</Link></Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={BookOpen} title="Belum ada course" description="Buat course pertama Anda, lalu tambahkan materinya.">
              <Button asChild><Link href="/teacher/courses/new"><Plus /> Buat course</Link></Button>
            </EmptyState>
          )}
        </section>

        <aside aria-labelledby="activity-title" className="rounded-xl border bg-card p-6 shadow-xs">
          <h2 id="activity-title" className="mb-5 font-display text-2xl">Aktivitas student</h2>
          {activity.length > 0 ? (
            <ol className="space-y-4">
              {activity.map((item, index) => {
                const { icon: Icon, text } = ACTIVITY[item.type];
                return (
                  <li key={index} className="flex gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="text-sm">
                      <p className="[&_b]:font-medium">{text(item)}</p>
                      <p className="text-xs text-muted-foreground">{formatRelative(item.at)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada aktivitas student.</p>
          )}
          <dl className="mt-6 grid grid-cols-2 gap-3 border-t pt-5 text-center">
            <div>
              <dt className="text-xs text-muted-foreground">Enrollment</dt>
              <dd className="font-display text-3xl">{stats.total_enrollments}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Lulus 100%</dt>
              <dd className="font-display text-3xl">{stats.completed_enrollments}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </>
  );
}
