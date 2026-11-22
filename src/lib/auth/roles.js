/**
 * Konstanta role. File ini tidak memakai database sehingga aman
 * di-import dari mana saja (server, client, maupun middleware).
 */

export const ROLES = Object.freeze({
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
});

export const ROLE_LABELS = Object.freeze({
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
});

/** Halaman utama setiap role setelah login. */
export function getDashboardPath(role) {
  switch (role) {
    case ROLES.ADMIN:
      return "/admin";
    case ROLES.TEACHER:
      return "/teacher";
    default:
      return "/student";
  }
}

/** Prefix URL yang wajib login (dipakai middleware). */
export const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/teacher", "/student", "/profile"];

/**
 * Mencegah open redirect: hanya izinkan path internal seperti "/student",
 * tolak "https://situs-lain.com" atau "//situs-lain.com".
 */
export function getSafeRedirectPath(value, fallback = "/dashboard") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
