import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { getPendingApplicationCount } from "@/lib/db/queries/admin";

// Lapisan 2: hanya Admin yang boleh membuka /admin/*.
export default async function AdminLayout({ children }) {
  const user = await requireRole(ROLES.ADMIN);
  const pendingApplications = await getPendingApplicationCount();

  return (
    <DashboardShell user={user} badges={{ pendingApplications }}>
      {children}
    </DashboardShell>
  );
}
