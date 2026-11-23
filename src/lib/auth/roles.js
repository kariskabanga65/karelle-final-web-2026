export const ROLES = Object.freeze({
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
});


export const LEARNER_ROLES = Object.freeze([ROLES.STUDENT, ROLES.TEACHER]);

export const ROLE_LABELS = Object.freeze({
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
});


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


export const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/teacher", "/student", "/profile", "/notifications"];


export function getSafeRedirectPath(value, fallback = "/dashboard") {
  if (typeof value !== "string" || value.length > 512) return fallback;
  if (/[\u0000-\u001F\u007F\s\\]/.test(value)) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const base = "http://karelle.local";
    const url = new URL(value, base);
    if (url.origin !== base) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
