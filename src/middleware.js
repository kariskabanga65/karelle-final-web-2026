import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Lapisan 1 keamanan: penjaga pintu halaman private.
 *
 * - Hanya MEMBACA COOKIE session (bukan localStorage).
 * - TIDAK membuka koneksi PostgreSQL dan tidak menjalankan query SQL.
 * - Hanya memeriksa apakah cookie ada, bukan apakah session masih
 *   berlaku atau apa role user. Pemeriksaan itu dilakukan di server
 *   (requireRole di halaman, Server Action, dan Route Handler).
 *
 * Catatan Next.js 16: konvensi `middleware` sudah deprecated dan diganti
 * namanya menjadi `proxy`, tetapi masih didukung. File ini tetap memakai
 * nama middleware.js sesuai ketentuan tugas.
 */
export function middleware(request) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    const { pathname, search } = request.nextUrl;
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/profile/:path*",
  ],
};
