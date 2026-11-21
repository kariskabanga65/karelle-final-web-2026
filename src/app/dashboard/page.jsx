import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getDashboardPath } from "@/lib/auth/roles";

// /dashboard mengarahkan user ke dashboard sesuai role-nya.
export default async function DashboardRedirectPage() {
  const user = await requireUser();
  redirect(getDashboardPath(user.role));
}
