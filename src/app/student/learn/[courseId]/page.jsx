import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { queryOne } from "@/lib/db";
import { getEnrollment } from "@/lib/db/queries/enrollments";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatPercent } from "@/lib/utils/format";

export const metadata = { title: "Belajar | KARÉLLE" };

/**
 * Halaman belajar (versi sementara). Sudah memeriksa bahwa Student
 * benar-benar mengikuti course ini. Sidebar materi, Mark as Done, dan
 * diskusi dibangun pada Tahap 7.
 */
export default async function LearnPage({ params }) {
  const user = await requireRole(ROLES.STUDENT);
  const { courseId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(courseId)) notFound();

  const course = await queryOne(`SELECT id, title, slug FROM courses WHERE id = $1`, [courseId]);
  if (!course) notFound();

  const enrollment = await getEnrollment(user.id, course.id);
  if (!enrollment) redirect(`/courses/${course.slug}`); // belum ikut -> ke halaman detail

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-5 py-16">
      <p className="eyebrow">Ruang belajar</p>
      <h1 className="display-title text-5xl">{course.title}</h1>
      <div className="space-y-2">
        <div className="flex justify-between text-sm"><span>Progress</span><span>{formatPercent(enrollment.progress_percent)}</span></div>
        <Progress value={Number(enrollment.progress_percent)} />
      </div>
      <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
        Halaman materi lengkap (sidebar, Mark as Done, Lanjutkan, dan diskusi) dibangun pada Tahap 7.
      </p>
      <div className="flex gap-3">
        <Button asChild><Link href="/courses">Kembali ke katalog</Link></Button>
        <Button asChild variant="outline"><Link href="/student">Dashboard</Link></Button>
      </div>
    </main>
  );
}
