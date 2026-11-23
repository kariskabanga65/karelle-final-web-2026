import Link from "next/link";
import { ArrowRight, Award, BookOpen } from "lucide-react";
import { ClaimCertificateButton } from "@/components/certificates/claim-button";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/session";
import { redirectTeacherWithoutLearning } from "@/lib/learning/access";
import { LEARNER_ROLES, ROLES } from "@/lib/auth/roles";
import { listClaimableCourses, listStudentCertificates } from "@/lib/db/queries/certificates";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "Sertifikat Saya | KARÉLLE" };

export default async function StudentCertificatesPage() {
  const user = await requireRole(...LEARNER_ROLES);
  await redirectTeacherWithoutLearning(user);
  const [certificates, claimable] = await Promise.all([listStudentCertificates(user.id), listClaimableCourses(user.id)]);

  return (
    <DashboardShell user={user}>
      <PageHeader
        eyebrow="Certificates"
        title="Sertifikat saya"
        description="Sertifikat terbit otomatis saat Anda menyelesaikan 100% materi sebuah course. Setiap sertifikat punya nomor unik yang bisa diverifikasi publik."
      />

      {claimable.length > 0 && (
        <section aria-label="Sertifikat siap diterbitkan" className="rounded-xl border border-silver bg-card p-5 shadow-xs">
          <p className="mb-3 font-medium">Course berikut sudah 100% dan sertifikatnya siap diterbitkan:</p>
          <ul className="divide-y">
            {claimable.map((course) => (
              <li key={course.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <span>{course.title}</span>
                <ClaimCertificateButton courseId={course.id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {certificates.length > 0 ? (
        <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {certificates.map((certificate) => (
            <li key={certificate.id}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-ink p-6 text-white shadow-xs">
                <div aria-hidden className="pointer-events-none absolute inset-3 rounded-lg border border-white/15" />
                <Award className="size-8 stroke-[1.2]" aria-hidden />
                <p className="eyebrow mt-6 text-white/60">Certificate of Completion</p>
                <h2 className="mt-2 font-display text-3xl leading-tight">{certificate.course_title}</h2>
                <p className="mt-1 text-sm text-white/60">bersama {certificate.teacher_name}</p>
                <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-white/15 pt-4 text-xs">
                  <div>
                    <dt className="text-white/50">Nomor</dt>
                    <dd className="font-mono">{certificate.certificate_number}</dd>
                  </div>
                  <div>
                    <dt className="text-white/50">Terbit</dt>
                    <dd>{formatDate(certificate.issued_at)}</dd>
                  </div>
                </dl>
                <Button asChild variant="light" className="relative mt-6">
                  <Link href={`/student/certificates/${certificate.id}`}>Lihat & unduh <ArrowRight /></Link>
                </Button>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        claimable.length === 0 && (
          <EmptyState icon={Award} title="Belum ada sertifikat" description="Selesaikan seluruh materi sebuah course untuk mendapatkan sertifikat pertama Anda.">
            <Button asChild><Link href="/student/courses"><BookOpen /> Lanjutkan belajar</Link></Button>
          </EmptyState>
        )
      )}
    </DashboardShell>
  );
}
