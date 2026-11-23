import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/auth/api-guard";
import { ROLES } from "@/lib/auth/roles";
import { CONTENT_TYPES, detectImageType, MAX_UPLOAD_BYTES, saveUpload } from "@/lib/uploads";


export async function POST(request) {
  const { errorResponse } = await authorizeRequest(request, [ROLES.TEACHER]);
  if (errorResponse) return errorResponse;

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_UPLOAD_BYTES + 64 * 1024) return tooLarge();

  let file;
  try {
    const formData = await request.formData();
    file = formData.get("file");
  } catch {
    return NextResponse.json({ success: false, error: "Kirim file sebagai multipart/form-data dengan field \"file\"." }, { status: 400 });
  }

  if (!file || typeof file === "string") {
    return NextResponse.json({ success: false, error: "File gambar wajib diunggah." }, { status: 400 });
  }
  if (file.size === 0) return NextResponse.json({ success: false, error: "File kosong." }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) return tooLarge();

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = detectImageType(bytes);
  if (!ext) {
    return NextResponse.json({ success: false, error: "Format tidak didukung. Gunakan JPG, PNG, atau WEBP." }, { status: 415 });
  }

  try {
    const url = await saveUpload(bytes, ext);
    return NextResponse.json({ success: true, url, contentType: CONTENT_TYPES[ext], size: bytes.length }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/uploads]", error);
    return NextResponse.json({ success: false, error: "Gagal menyimpan file." }, { status: 500 });
  }
}

function tooLarge() {
  return NextResponse.json({ success: false, error: "Ukuran file maksimal 2 MB." }, { status: 413 });
}
