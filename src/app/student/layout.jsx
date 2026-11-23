import { requireRole } from "@/lib/auth/session";
import { LEARNER_ROLES, ROLES } from "@/lib/auth/roles";

export default async function StudentLayout({ children }) {
  await requireRole(...LEARNER_ROLES);
  return children;
}
