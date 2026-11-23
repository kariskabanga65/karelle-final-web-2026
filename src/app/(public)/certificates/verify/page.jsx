import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { VerifyForm } from "@/components/certificates/verify-form";

export const metadata = {
  title: "Verifikasi Sertifikat | KARÉLLE",
  description: "Periksa keaslian sertifikat KARÉLLE Modeling Course dengan nomor sertifikat.",
};

export default async function VerifyCertificatePage({ searchParams }) {
  const { number } = await searchParams;
  if (typeof number === "string" && number.trim()) {
    redirect(`/certificates/verify/${encodeURIComponent(number.trim().toUpperCase().replace(/\s+/g, ""))}`);
  }

  return (
    <section className="bg-[radial-gradient(ellipse_at_30%_20%,#5a5a5a_0%,#1f1f1f_55%,#0e0e0e_100%)] text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center gap-8 px-5 py-28 text-center sm:px-8">
        <ShieldCheck className="mx-auto size-12 stroke-[1.2]" aria-hidden />
        <div className="space-y-3">
          <p className="eyebrow text-white/70">Certificate Verification</p>
          <h1 className="display-title text-5xl">Verifikasi <em className="font-display italic">sertifikat</em></h1>
          <p className="text-white/70">Masukkan nomor sertifikat yang tertera di bagian bawah sertifikat, atau pindai QR code-nya.</p>
        </div>
        <VerifyForm dark />
      </div>
    </section>
  );
}
