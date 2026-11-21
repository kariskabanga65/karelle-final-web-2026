import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";

// Lapisan 2: hanya Admin yang boleh membuka /admin/*.
export default async function AdminLayout({ children }) {
  await requireRole(ROLES.ADMIN);
  return children;
}
