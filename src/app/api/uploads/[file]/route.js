import { NextResponse } from "next/server";
import { CONTENT_TYPES, readUpload } from "@/lib/uploads";


export async function GET(_request, { params }) {
  const { file } = await params;
  const bytes = await readUpload(file);
  if (!bytes) return NextResponse.json({ success: false, error: "File tidak ditemukan." }, { status: 404 });

  const ext = file.split(".").pop();
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": CONTENT_TYPES[ext],
      "Content-Length": String(bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
