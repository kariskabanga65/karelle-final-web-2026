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

export const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/teacher", "/student", "/profile"];

export function getSafeRedirectPath(value, fallback = "/dashboard") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
