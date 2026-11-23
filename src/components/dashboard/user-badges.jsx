import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/auth/roles";

export function RoleBadge({ role }) {
  const variant = role === "admin" ? "default" : role === "teacher" ? "secondary" : "outline";
  return <Badge variant={variant}>{ROLE_LABELS[role]}</Badge>;
}

export function AccountStatusBadge({ role, applicationStatus }) {
  if (applicationStatus === "pending") return <Badge variant="warning">Pending Teacher</Badge>;
  if (applicationStatus === "rejected" && role === "student") return <Badge variant="destructive">Pengajuan ditolak</Badge>;
  return <Badge variant="success">Aktif</Badge>;
}
