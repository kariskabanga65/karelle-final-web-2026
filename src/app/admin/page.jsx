import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { DashboardPlaceholder } from "@/components/shared/dashboard-placeholder";

export const metadata = { title: "Admin Dashboard | KARÉLLE" };

export default async function AdminDashboardPage() {
  const user = await requireRole(ROLES.ADMIN);
  return <DashboardPlaceholder user={user} title="Admin Dashboard" stage="Tahap 5" />;
}
