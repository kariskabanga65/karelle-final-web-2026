import Link from "next/link";
import {
  Award,
  BookOpen,
  FolderTree,
  GraduationCap,
  MessageSquare,
  UserCheck,
  UserPlus,
  Users,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { getAdminStats, getRecentActivity } from "@/lib/db/queries/admin";
import { formatRelative } from "@/lib/utils/format";

export const metadata = { title: "Admin Dashboard | KARÉLLE" };

const ACTIVITY = {
  register: { icon: UserPlus, text: (a) => <><b>{a.actor}</b> membuat akun baru</> },
  enroll: { icon: BookOpen, text: (a) => <><b>{a.actor}</b> mengikuti <b>{a.target}</b></> },
  application: { icon: UserCheck, text: (a) => <><b>{a.actor}</b> mengajukan diri sebagai Teacher ({a.target})</> },
  comment: { icon: MessageSquare, text: (a) => <><b>{a.actor}</b> berdiskusi di materi <b>{a.target}</b></> },
  certificate: { icon: Award, text: (a) => <><b>{a.actor}</b> menerima sertifikat <b>{a.target}</b></> },
};

export default async function AdminDashboardPage() {
  const user = await requireRole(ROLES.ADMIN);
  const [stats, activity] = await Promise.all([getAdminStats(), getRecentActivity(8)]);

  return (
    <>
      <PageHeader eyebrow="Admin Dashboard" title={`Halo, ${user.name.split(" ")[0]}`} description="Ringkasan platform KARÉLLE hari ini." />

      <section aria-label="Statistik" className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Pengajuan Teacher pending" value={stats.pending_applications} icon={UserCheck} href="/admin/teacher-applications" highlight={stats.pending_applications > 0} />
        <StatCard label="Total users" value={stats.total_users} icon={Users} href="/admin/users" />
        <StatCard label="Total teachers" value={stats.total_teachers} icon={GraduationCap} href="/admin/users?role=teacher" />
        <StatCard label="Total students" value={stats.total_students} icon={UsersRound} href="/admin/users?role=student" />
        <StatCard label="Total courses" value={stats.total_courses} icon={BookOpen} href="/admin/courses" />
        <StatCard label="Total kategori" value={stats.total_categories} icon={FolderTree} href="/admin/categories" />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section aria-labelledby="activity-title" className="rounded-xl border bg-card p-6 shadow-xs">
          <h2 id="activity-title" className="mb-5 font-display text-2xl">Aktivitas terbaru</h2>
          {activity.length > 0 ? (
            <ol className="space-y-4">
              {activity.map((item, index) => {
                const { icon: Icon, text } = ACTIVITY[item.type];
                return (
                  <li key={index} className="flex gap-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary">
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
            <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>
          )}
        </section>

        <aside className="space-y-4 rounded-xl border bg-card p-6 shadow-xs">
          <h2 className="font-display text-2xl">Ringkasan belajar</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Total enrollment</dt><dd className="font-medium">{stats.total_enrollments}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Sertifikat terbit</dt><dd className="font-medium">{stats.total_certificates}</dd></div>
          </dl>
          <div className="flex flex-col gap-2 border-t pt-4">
            <Button asChild><Link href="/admin/courses/new">Buat course baru</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/users/new">Tambah user</Link></Button>
          </div>
        </aside>
      </div>
    </>
  );
}
