import Link from "next/link";
import { Check, UserCheck } from "lucide-react";
import { approveApplicationAction, rejectApplicationAction } from "@/actions/teacher-application-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { EmptyState } from "@/components/shared/empty-state";
import { RejectApplicationButton } from "@/components/shared/reject-application-button";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { listTeacherApplications } from "@/lib/db/queries/teacher-applications";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatRelative } from "@/lib/utils/format";

export const metadata = { title: "Pengajuan Teacher | Admin KARÉLLE" };

const TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Disetujui" },
  { value: "rejected", label: "Ditolak" },
  { value: "all", label: "Semua" },
];

const STATUS_BADGE = {
  pending: <Badge variant="warning">Pending</Badge>,
  approved: <Badge variant="success">Disetujui</Badge>,
  rejected: <Badge variant="destructive">Ditolak</Badge>,
};

export default async function TeacherApplicationsPage({ searchParams }) {
  await requireRole(ROLES.ADMIN);
  const { status = "pending" } = await searchParams;
  const active = TABS.some((tab) => tab.value === status) ? status : "pending";
  const applications = await listTeacherApplications(active === "all" ? null : active);

  return (
    <>
      <PageHeader
        eyebrow="Verifikasi Teacher"
        title="Pengajuan Teacher"
        description="Pendaftar lewat form Register as Teacher masuk sebagai Student sampai disetujui di sini."
      />

      <nav aria-label="Filter status" className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "pending" ? "/admin/teacher-applications" : `/admin/teacher-applications?status=${tab.value}`}
            aria-current={active === tab.value ? "page" : undefined}
            className={cn("rounded-full border px-4 py-2 text-sm", active === tab.value ? "border-ink bg-ink text-white" : "bg-card hover:border-ink")}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {applications.length > 0 ? (
        <ul className="grid gap-4">
          {applications.map((app) => (
            <li key={app.id} className="space-y-4 rounded-xl border bg-card p-6 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-2xl">{app.name}</h2>
                    {STATUS_BADGE[app.status]}
                  </div>
                  <p className="text-sm text-muted-foreground">@{app.username} · {app.email} · diajukan {formatRelative(app.created_at)}</p>
                </div>
                {app.status === "pending" && (
                  <div className="flex gap-2">
                    <RejectApplicationButton action={rejectApplicationAction.bind(null, app.id)} applicantName={app.name} />
                    <ConfirmActionButton
                      action={approveApplicationAction.bind(null, app.id)}
                      title="Setujui pengajuan?"
                      description={`Role ${app.name} akan berubah menjadi Teacher dan ia dapat membuat course.`}
                      confirmLabel="Approve"
                      variant="default"
                      triggerVariant="default"
                    >
                      <Check /> Approve
                    </ConfirmActionButton>
                  </div>
                )}
              </div>
              <dl className="grid gap-4 text-sm sm:grid-cols-3">
                <div><dt className="text-xs text-muted-foreground uppercase">Bidang keahlian</dt><dd className="mt-1 font-medium">{app.expertise}</dd></div>
                <div><dt className="text-xs text-muted-foreground uppercase">Pengalaman</dt><dd className="mt-1">{app.experience || "-"}</dd></div>
                <div><dt className="text-xs text-muted-foreground uppercase">Motivasi</dt><dd className="mt-1">{app.motivation || "-"}</dd></div>
              </dl>
              {app.status === "approved" && (
                <p className="border-t pt-3 text-xs text-muted-foreground">
                  Disetujui {formatDate(app.approved_at)}{app.approved_by_name && <> oleh {app.approved_by_name}</>}
                </p>
              )}
              {app.status === "rejected" && (
                <p className="border-t pt-3 text-xs text-muted-foreground">
                  Ditolak {formatDate(app.rejected_at)}{app.rejection_reason && <> · Alasan: {app.rejection_reason}</>}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={UserCheck} title="Tidak ada pengajuan" description={active === "pending" ? "Semua pengajuan Teacher sudah diproses." : "Belum ada pengajuan dengan status ini."} />
      )}
    </>
  );
}
