import Link from "next/link";
import { BookOpen, Compass } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { EnrolledCourseCard } from "@/components/student/enrolled-course-card";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/session";
import { redirectTeacherWithoutLearning } from "@/lib/learning/access";
import { LEARNER_ROLES, ROLES } from "@/lib/auth/roles";
import { listStudentCourses } from "@/lib/db/queries/student";
import { cn } from "@/lib/utils/cn";

export const metadata = { title: "Kelas Saya | KARÉLLE" };

const TABS = [
  { value: "", label: "Semua" },
  { value: "active", label: "Sedang dipelajari" },
  { value: "completed", label: "Selesai" },
];

export default async function StudentCoursesPage({ searchParams }) {
  const user = await requireRole(...LEARNER_ROLES);
  await redirectTeacherWithoutLearning(user);
  const params = await searchParams;
  const status = ["active", "completed"].includes(params.status) ? params.status : "";
  const [courses, all] = await Promise.all([listStudentCourses(user.id, status), status ? listStudentCourses(user.id) : null]);
  const counts = countByStatus(all ?? courses);

  return (
    <DashboardShell user={user}>
      <PageHeader
        eyebrow="My Courses"
        title="Kelas saya"
        description={
          user.role === ROLES.TEACHER
            ? "Kelas yang Anda ikuti sebelum menjadi Teacher. Progres dan sertifikatnya tetap milik Anda."
            : "Semua kelas yang Anda ikuti beserta progres belajarnya."
        }
      >
        {user.role === ROLES.STUDENT && (
          <Button asChild variant="outline"><Link href="/courses"><Compass /> Cari kelas lain</Link></Button>
        )}
      </PageHeader>

      <nav aria-label="Filter status kelas" className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const active = tab.value === status;
          return (
            <Link
              key={tab.label}
              href={tab.value ? `/student/courses?status=${tab.value}` : "/student/courses"}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                active ? "border-ink bg-ink text-white" : "bg-card hover:border-ink",
              )}
            >
              {tab.label} <span className={cn("ml-1 text-xs", active ? "text-white/70" : "text-muted-foreground")}>{counts[tab.value || "all"]}</span>
            </Link>
          );
        })}
      </nav>

      {courses.length > 0 ? (
        <div className="space-y-4">
          {courses.map((course) => <EnrolledCourseCard key={course.enrollment_id} course={course} />)}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title={status === "completed" ? "Belum ada kelas yang selesai" : status === "active" ? "Tidak ada kelas yang sedang dipelajari" : "Belum mengikuti kelas"}
          description={status ? "Coba lihat tab lainnya." : "Pilih kelas dari katalog dan mulai belajar."}
        >
          {!status && user.role === ROLES.STUDENT && <Button asChild><Link href="/courses">Lihat katalog</Link></Button>}
        </EmptyState>
      )}
    </DashboardShell>
  );
}

function countByStatus(rows) {
  return {
    all: rows.length,
    active: rows.filter((row) => row.status === "active").length,
    completed: rows.filter((row) => row.status === "completed").length,
  };
}
