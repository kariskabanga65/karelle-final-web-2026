import { NextResponse } from "next/server";
import { CERTIFICATE_NUMBER_PATTERN, getCertificateByNumber } from "@/lib/db/queries/certificates";

export async function GET(_request, { params }) {
  const { number: raw } = await params;
  const number = decodeURIComponent(raw).trim().toUpperCase();
  if (!CERTIFICATE_NUMBER_PATTERN.test(number)) {
    return NextResponse.json(
      { success: false, valid: false, error: "Format nomor sertifikat tidak valid. Contoh: KRL-2026-A1B2C3D4E5" },
      { status: 400 },
    );
  }

  try {
    const certificate = await getCertificateByNumber(number);
    if (!certificate) {
      return NextResponse.json({ success: true, valid: false, error: "Sertifikat tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      valid: true,
      data: {
        certificateNumber: certificate.certificate_number,
        studentName: certificate.student_name,
        courseTitle: certificate.course_title,
        teacherName: certificate.teacher_name,
        issuedAt: certificate.issued_at,
      },
    });
  } catch (error) {
    console.error("[GET /api/certificates/verify]", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
