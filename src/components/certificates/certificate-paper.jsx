import Image from "next/image";


export function CertificatePaper({ certificate, qrSvg, verifyUrl }) {
  const issued = new Date(certificate.issued_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Makassar",
  });

  return (
    <div
      id="certificate"
      className="certificate-paper @container relative aspect-[297/210] w-full overflow-hidden bg-[#faf8f4] text-ink shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)]"
    >
      <div className="absolute inset-[2.2cqw] border-[0.28cqw] border-ink" />
      <div className="absolute inset-[3.2cqw] border-[0.12cqw] border-silver" />
      {["top-[2.2cqw] left-[2.2cqw]", "top-[2.2cqw] right-[2.2cqw]", "bottom-[2.2cqw] left-[2.2cqw]", "right-[2.2cqw] bottom-[2.2cqw]"].map((pos) => (
        <span key={pos} aria-hidden className={`absolute ${pos} size-[2.4cqw] -translate-x-0 bg-[#faf8f4]`}>
          <span className="absolute inset-[0.55cqw] rotate-45 border-[0.12cqw] border-ink" />
        </span>
      ))}

      <div className="relative flex h-full flex-col items-center px-[9cqw] pt-[6.2cqw] pb-[5.4cqw] text-center">
        <Image src="/images/logo-karelle.png" alt="KARÉLLE Modeling Course" width={1059} height={634} className="h-auto w-[15cqw] brightness-0" priority />

        <p className="mt-[2.4cqw] font-sans tracking-[0.55em] uppercase" style={{ fontSize: "1.15cqw" }}>Certificate of Completion</p>
        <p className="mt-[1.2cqw] font-display italic text-ink/70" style={{ fontSize: "1.6cqw" }}>Sertifikat ini diberikan kepada</p>

        <p className="mt-[0.8cqw] max-w-full truncate font-display italic leading-none" style={{ fontSize: "5.6cqw" }}>
          {certificate.student_name}
        </p>
        <span aria-hidden className="mt-[1.4cqw] h-[0.12cqw] w-[38cqw] bg-gradient-to-r from-transparent via-silver to-transparent" />

        <p className="mt-[1.6cqw] max-w-[62cqw] text-ink/75" style={{ fontSize: "1.45cqw", lineHeight: 1.5 }}>
          atas keberhasilannya menyelesaikan seluruh materi course
        </p>
        <p className="mt-[0.6cqw] font-display uppercase tracking-[0.08em]" style={{ fontSize: "2.7cqw" }}>
          {certificate.course_title}
        </p>
        {certificate.category_name && (
          <p className="mt-[0.4cqw] tracking-[0.35em] text-ink/60 uppercase" style={{ fontSize: "0.95cqw" }}>{certificate.category_name}</p>
        )}

        <div className="mt-auto grid w-full grid-cols-[1fr_auto_1fr] items-end gap-[4cqw]">
          <Signature name={certificate.teacher_name} role="Instruktur" />
          <div className="flex flex-col items-center gap-[0.6cqw]">
            {qrSvg && (
              <div
                className="size-[8.5cqw] bg-white p-[0.5cqw] [&_svg]:size-full"
                role="img"
                aria-label={`QR code verifikasi ${certificate.certificate_number}`}
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            )}
            <p className="font-mono tracking-wider" style={{ fontSize: "0.95cqw" }}>{certificate.certificate_number}</p>
          </div>
          <Signature name={issued} role="Tanggal terbit" />
        </div>
        {verifyUrl && (
          <p className="mt-[1.2cqw] text-ink/50" style={{ fontSize: "0.8cqw" }}>
            Verifikasi keaslian: {verifyUrl}
          </p>
        )}
      </div>
    </div>
  );
}

function Signature({ name, role }) {
  return (
    <div className="flex flex-col items-center">
      <p className="font-display italic" style={{ fontSize: "1.9cqw" }}>{name}</p>
      <span aria-hidden className="my-[0.6cqw] h-[0.1cqw] w-full max-w-[24cqw] bg-ink/60" />
      <p className="tracking-[0.3em] text-ink/60 uppercase" style={{ fontSize: "0.9cqw" }}>{role}</p>
    </div>
  );
}
