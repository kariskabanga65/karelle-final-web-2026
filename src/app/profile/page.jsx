import Link from "next/link";
import { BookOpen, GraduationCap } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { ProfileForm } from "@/components/forms/profile-form";
import { LogoutButton } from "@/components/shared/logout-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth/session";
import { ROLE_LABELS, ROLES } from "@/lib/auth/roles";
import { listStudentCourses } from "@/lib/db/queries/student";
import { getTeacherCourseSummaries } from "@/lib/db/queries/teacher-dashboard";
import { getLatestTeacherApplication } from "@/lib/db/queries/teacher-applications";
import { formatDate, formatPercent, getInitials } from "@/lib/utils/format";

export const metadata = { title: "Profil | KARÉLLE" };
export default async function ProfilePage() {
  const user = await requireUser();
  const [application, enrolled, teaching] = await Promise.all([
    getLatestTeacherApplication(user.id),
    user.role !== ROLES.ADMIN ? listStudentCourses(user.id) : [],
    user.role === ROLES.TEACHER ? getTeacherCourseSummaries(user.id) : [],
  ]);

  const isPending = application?.status === "pending";
  const isRejected = application?.status === "rejected" && user.role === ROLES.STUDENT;
  const showWelcomeTeacher = user.role === ROLES.TEACHER && application?.is_newly_approved;

  return (
    <DashboardShell user={user}>
      <section className="overflow-hidden rounded-2xl border bg-card shadow-xs">
        <div className="h-24 bg-[radial-gradient(ellipse_at_20%_50%,#7a7a7a_0%,#262626_55%,#0e0e0e_100%)]" />
        <div className="flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Avatar className="-mt-12 size-24 border-4 border-card">
              {user.image && <AvatarImage src={user.image} alt={`Foto ${user.name}`} className="grayscale" />}
              <AvatarFallback className="bg-ink font-display text-3xl text-white">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl">{user.name}</h1>
                <Badge>{ROLE_LABELS[user.role]}</Badge>
              </div>
              {user.headline && <p className="text-sm text-muted-foreground">{user.headline}</p>}
              <p className="text-sm text-muted-foreground">@{user.username} · {user.email}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
        {user.bio && <p className="border-t px-6 py-4 text-sm leading-relaxed text-muted-foreground">{user.bio}</p>}
      </section>

      {showWelcomeTeacher && (
        <div role="status" className="rounded-xl border border-silver bg-card px-5 py-4 text-sm">
          <p className="font-semibold">Selamat datang, Teacher! 🎉</p>
          <p>Pengajuan Anda telah disetujui Admin. Sekarang Anda dapat membuat course.</p>
        </div>
      )}
      {isPending && (
        <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Akun pengajar Anda sedang menunggu verifikasi Admin. Sementara itu Anda tetap dapat belajar sebagai Student.
        </div>
      )}
      {isRejected && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          Pengajuan Teacher Anda ditolak.
          {application.rejection_reason && <> Alasan: {application.rejection_reason}</>}
        </div>
      )}

      {(user.role === ROLES.STUDENT || enrolled.length > 0) && (
        <CourseSection title="Kelas yang diikuti" icon={GraduationCap} emptyText="Belum mengikuti kelas." emptyHref="/courses" emptyLabel="Lihat katalog">
          {enrolled.map((course) => (
            <CourseRow
              key={course.enrollment_id}
              href={`/student/learn/${course.course_id}`}
              title={course.title}
              meta={`${course.category_name} · bergabung ${formatDate(course.enrolled_at)}`}
              percent={Number(course.progress_percent)}
              badge={course.status === "completed" ? "Selesai" : null}
            />
          ))}
        </CourseSection>
      )}

      {user.role === ROLES.TEACHER && (
        <CourseSection title="Kelas yang diajar" icon={BookOpen} emptyText="Belum ada course." emptyHref="/teacher/courses/new" emptyLabel="Buat course">
          {teaching.map((course) => (
            <CourseRow
              key={course.id}
              href={`/teacher/courses/${course.id}/contents`}
              title={course.title}
              meta={`${course.content_count} materi · ${course.student_count} student`}
              percent={course.average_progress}
              percentLabel="rata-rata progress student"
            />
          ))}
        </CourseSection>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section aria-labelledby="edit-profile" className="rounded-xl border bg-card p-6 shadow-xs">
          <h2 id="edit-profile" className="mb-1 font-display text-2xl">Edit profil</h2>
          <p className="mb-5 text-sm text-muted-foreground">Email dan username tidak dapat diubah.</p>
          <ProfileForm user={{ name: user.name, headline: user.headline, bio: user.bio }} />
        </section>
        <section aria-labelledby="change-password" className="rounded-xl border bg-card p-6 shadow-xs">
          <h2 id="change-password" className="mb-1 font-display text-2xl">Ganti password</h2>
          <p className="mb-5 text-sm text-muted-foreground">Setelah diganti, sesi di perangkat lain otomatis dikeluarkan.</p>
          <ChangePasswordForm />
        </section>
      </div>
    </DashboardShell>
  );
}

function CourseSection({ title, icon: Icon, emptyText, emptyHref, emptyLabel, children }) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <section aria-label={title} className="rounded-xl border bg-card p-6 shadow-xs">
      <h2 className="mb-4 flex items-center gap-2 font-display text-2xl"><Icon className="size-5" aria-hidden /> {title}</h2>
      {items.length > 0 ? (
        <ul className="divide-y">{children}</ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          {emptyText} <Link href={emptyHref} className="font-medium text-foreground underline underline-offset-4">{emptyLabel}</Link>
        </p>
      )}
    </section>
  );
}

function CourseRow({ href, title, meta, percent, badge = null, percentLabel = "progress" }) {
  return (
    <li className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-6">
      <div className="min-w-0 flex-1">
        <Link href={href} className="font-medium underline-offset-4 hover:underline">{title}</Link>
        {badge && <Badge variant="success" className="ml-2">{badge}</Badge>}
        <p className="text-xs text-muted-foreground">{meta}</p>
      </div>
      <div className="w-full space-y-1 sm:w-48">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{percentLabel}</span>
          <span className="font-medium text-foreground">{formatPercent(percent)}</span>
        </div>
        <Progress value={percent} aria-label={`${percentLabel} ${title}`} />
      </div>
    </li>
  );
}
