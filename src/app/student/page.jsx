import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { DashboardPlaceholder } from "@/components/shared/dashboard-placeholder";

export const metadata = { title: "Student Dashboard | KARÉLLE" };

export default async function StudentDashboardPage() {
  const user = await requireRole(ROLES.STUDENT);
  return <DashboardPlaceholder user={user} title="Student Dashboard" stage="Tahap 7" />;
}
