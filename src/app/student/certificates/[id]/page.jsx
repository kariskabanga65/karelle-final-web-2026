import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { ArrowLeft, Info } from "lucide-react";
import { CertificatePaper } from "@/components/certificates/certificate-paper";
import { CertificateToolbar } from "@/components/certificates/certificate-toolbar";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { FlashToast } from "@/components/shared/flash-toast";
import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { getVerifyUrl } from "@/lib/certificates/verify-url";
import { getCertificateForViewer } from "@/lib/db/queries/certificates";
import { isUuid } from "@/lib/utils/slug";

export const metadata = { title: "Sertifikat | KARÉLLE" };

export default async function CertificatePage({ params, searchParams }) {
  const user = await requireRole(ROLES.STUDENT);
  const { id } = await params;
  const { issued } = await searchParams;
  const certificate = isUuid(id) ? await getCertificateForViewer(id, user.role === ROLES.ADMIN ? null : user.id) : null;
  if (!certificate) notFound();

  const verifyUrl = await getVerifyUrl(certificate.certificate_number);
  const qrSvg = await QRCode.toString(verifyUrl, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#141414", light: "#ffffff" } });
  const backHref = user.role === ROLES.ADMIN ? "/admin/certificates" : "/student/certificates";

  return (
    <DashboardShell user={user}>
      <FlashToast message={issued ? "Sertifikat berhasil diterbitkan." : null} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Link href={backHref} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Kembali
          </Link>
          <h1 className="font-display text-4xl">{certificate.course_title}</h1>
          <p className="text-sm text-muted-foreground">Nomor sertifikat <span className="font-mono">{certificate.certificate_number}</span></p>
        </div>
        <CertificateToolbar verifyUrl={verifyUrl} />
      </div>

      <CertificatePaper certificate={certificate} qrSvg={qrSvg} verifyUrl={verifyUrl} />

      <p className="flex items-start gap-2 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        Klik &quot;Cetak / Simpan PDF&quot;, lalu pilih &quot;Simpan sebagai PDF&quot; di dialog cetak. Atur orientasi ke Landscape dan aktifkan &quot;Background graphics&quot; jika tersedia.
      </p>
    </DashboardShell>
  );
}
