import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";

// Lapisan 2: hanya Teacher (dan Admin) yang boleh membuka /teacher/*.
export default async function TeacherLayout({ children }) {
  await requireRole(ROLES.TEACHER);
  return children;
}
