import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { ROLES } from "./roles";

/**
 * Lapisan 2 keamanan: validasi session ASLI ke database.
 *
 * Middleware hanya memeriksa apakah cookie ada. Fungsi-fungsi di bawah
 * memastikan session masih berlaku dan membaca role terbaru dari tabel
 * users, sehingga perubahan role (misalnya setelah approval Teacher)
 * langsung berlaku tanpa perlu login ulang.
 *
 * cache() membuat session hanya dibaca sekali per request walaupun
 * dipanggil dari beberapa komponen.
 */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/** User yang sedang login, atau null. */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/** Wajib login. Guest diarahkan ke halaman login. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Wajib login DAN memiliki salah satu role yang diizinkan.
 * Admin selalu diizinkan karena memiliki akses penuh.
 *
 *   const user = await requireRole(ROLES.TEACHER);
 */
export async function requireRole(...allowedRoles) {
  const user = await requireUser();
  if (!hasRole(user, allowedRoles)) redirect("/unauthorized");
  return user;
}

export function hasRole(user, allowedRoles) {
  if (!user) return false;
  if (user.role === ROLES.ADMIN) return true;
  return allowedRoles.includes(user.role);
}
