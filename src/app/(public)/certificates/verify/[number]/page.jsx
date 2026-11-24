import { BadgeCheck, ShieldX } from "lucide-react";
import { VerifyForm } from "@/components/certificates/verify-form";
import { BackLink } from "@/components/shared/back-link";
import { CERTIFICATE_NUMBER_PATTERN, getCertificateByNumber } from "@/lib/db/queries/certificates";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "Hasil Verifikasi Sertifikat | KARÉLLE", robots: { index: false } };

export default async function VerifyResultPage({ params }) {
  const { number: raw } = await params;
  const number = decodeURIComponent(raw).trim().toUpperCase();
  const certificate = CERTIFICATE_NUMBER_PATTERN.test(number) ? await getCertificateByNumber(number) : null;

  return (
    <section className="bg-[radial-gradient(ellipse_at_30%_20%,#5a5a5a_0%,#1f1f1f_55%,#0e0e0e_100%)] text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center gap-8 px-5 py-28 sm:px-8">
        {certificate ? (
          <div className="space-y-6 rounded-2xl border border-white/15 bg-white/5 p-8 backdrop-blur-sm" role="status">
            <div className="flex items-center gap-3">
              <BadgeCheck className="size-10 stroke-[1.3]" aria-hidden />
              <div>
                <p className="eyebrow text-white/70">Sertifikat sah</p>
                <h1 className="font-display text-3xl">Terverifikasi oleh KARÉLLE</h1>
              </div>
            </div>
            <dl className="grid gap-4 border-t border-white/15 pt-6 sm:grid-cols-2">
              <Detail label="Nomor sertifikat" value={<span className="font-mono">{certificate.certificate_number}</span>} />
              <Detail label="Tanggal terbit" value={formatDate(certificate.issued_at)} />
              <Detail label="Diberikan kepada" value={<span className="font-display text-2xl italic">{certificate.student_name}</span>} />
              <Detail label="Course" value={certificate.course_title} />
              <Detail label="Instruktur" value={certificate.teacher_name} />
            </dl>
          </div>
        ) : (
          <div className="space-y-3 rounded-2xl border border-white/15 bg-white/5 p-8 text-center" role="alert">
            <ShieldX className="mx-auto size-10 stroke-[1.3]" aria-hidden />
            <h1 className="font-display text-3xl">Sertifikat tidak ditemukan</h1>
            <p className="text-white/70">
              Nomor <span className="font-mono break-all">{number.slice(0, 40)}</span> tidak terdaftar. Periksa kembali penulisan nomor sertifikat.
            </p>
          </div>
        )}
        <div className="space-y-3">
          <p className="text-sm text-white/60">Verifikasi nomor lain:</p>
          <VerifyForm dark />
        </div>
        <BackLink className="mx-auto text-center text-sm text-white/60 underline-offset-4 hover:text-white hover:underline" />
      </div>
    </section>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs tracking-wider text-white/50 uppercase">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
