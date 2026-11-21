import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { DashboardPlaceholder } from "@/components/shared/dashboard-placeholder";

export const metadata = { title: "Teacher Dashboard | KARÉLLE" };

export default async function TeacherDashboardPage() {
  const user = await requireRole(ROLES.TEACHER);
  return <DashboardPlaceholder user={user} title="Teacher Dashboard" stage="Tahap 6" />;
}
