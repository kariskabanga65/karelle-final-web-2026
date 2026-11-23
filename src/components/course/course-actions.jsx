import Link from "next/link";
import { ArrowRight, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ROLES } from "@/lib/auth/roles";
import { formatPercent } from "@/lib/utils/format";
import { EnrollButton } from "./enroll-button";

/**
 * Tombol dinamis di kartu/detail course, sesuai siapa yang melihat:
 * - Guest                    : Login / Daftar
 * - Student belum ikut       : Ikuti Course
 * - Student sudah ikut       : progress + Lanjutkan Belajar
 * - Teacher pemilik course   : Kelola Course
 * - Admin                    : Kelola di panel Admin
 */
export function CourseActions({ course, viewer, enrollment, layout = "card" }) {
  const isDetail = layout === "detail";
  const size = isDetail ? "lg" : "default";
  let primary;
  if (!viewer) {
    primary = (
      <div className="flex flex-wrap gap-2">
        <Button asChild size={size}>
          <Link href={`/login?callbackUrl=${encodeURIComponent(`/courses/${course.slug}`)}`}>Login untuk ikut</Link>
        </Button>
        <Button asChild variant="secondary" size={size}>
          <Link href="/register/student">Daftar</Link>
        </Button>
      </div>
    );
  } else if (viewer.role === ROLES.STUDENT) {
    primary = enrollment ? (
      <div className="w-full space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{enrollment.status === "completed" ? "Selesai" : "Progress belajar"}</span>
            <span className="font-medium text-foreground">{formatPercent(enrollment.progress)}</span>
          </div>
          <Progress value={enrollment.progress} aria-label={`Progress ${formatPercent(enrollment.progress)}`} />
        </div>
        <Button asChild size={size}>
          <Link href={`/student/learn/${course.id}`}>
            Lanjutkan Belajar <ArrowRight />
          </Link>
        </Button>
      </div>
    ) : (
      <EnrollButton courseId={course.id} size={size} />
    );
  } else if (viewer.role === ROLES.TEACHER) {
    primary =
      viewer.id === course.teacher_id ? (
        <Button asChild size={size}>
          <Link href={`/teacher/courses/${course.id}/contents`}>
            <Settings2 /> Kelola Course
          </Link>
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">Course milik Teacher lain.</p>
      );
  } else {
    primary = (
      <Button asChild size={size}>
        <Link href={`/admin/courses/${course.id}/edit`}>
          <Settings2 /> Kelola di panel Admin
        </Link>
      </Button>
    );
  }

  return (
    <div className={isDetail ? "flex flex-col gap-3" : "flex flex-wrap items-end gap-2"}>
      {primary}
    </div>
  );
}
