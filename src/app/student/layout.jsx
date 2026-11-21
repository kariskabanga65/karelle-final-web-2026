import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";

// Lapisan 2: hanya Student (dan Admin) yang boleh membuka /student/*.
export default async function StudentLayout({ children }) {
  await requireRole(ROLES.STUDENT);
  return children;
}
