import { History, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { listActivityLogs } from "@/lib/db/queries/activity-logs";
import { formatDateTime } from "@/lib/utils/format";

export const metadata = { title: "Riwayat Aktivitas | Admin KARÉLLE" };

const ACTION_LABELS = {
  create: "Tambah",
  update: "Ubah",
  delete: "Hapus",
  approve: "Setujui",
  reject: "Tolak",
  role_change: "Ubah role",
};

const ACTION_STYLES = {
  create: "border-success/30 bg-success/10 text-success",
  update: "border-border bg-muted text-foreground",
  delete: "border-destructive/30 bg-destructive/10 text-destructive",
  approve: "border-success/30 bg-success/10 text-success",
  reject: "border-destructive/30 bg-destructive/10 text-destructive",
  role_change: "border-warning/30 bg-warning/10 text-warning",
};

const ENTITY_LABELS = {
  user: "User",
  course: "Course",
  category: "Kategori",
  teacher_application: "Pengajuan Teacher",
};

const ROLE_LABELS = { admin: "Admin", teacher: "Teacher", student: "Student" };

/** Mengubah nilai di kolom details menjadi teks yang mudah dibaca. */
function formatDetailValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "-";
  if (typeof value === "object" && "dari" in value && "menjadi" in value) {
    return `${formatDetailValue(value.dari)} → ${formatDetailValue(value.menjadi)}`;
  }
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return formatDateTime(value);
  return String(ROLE_LABELS[value] ?? value);
}

function DetailList({ details }) {
  const entries = Object.entries(details ?? {});
  if (entries.length === 0) return <span className="text-muted-foreground">-</span>;
  return (
    <dl className="space-y-0.5 text-xs">
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-1.5">
          <dt className="shrink-0 text-muted-foreground capitalize">{key.replaceAll("_", " ")}:</dt>
          <dd className="break-words">{formatDetailValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function ActivityLogsPage({ searchParams }) {
  await requireRole(ROLES.ADMIN);
  const params = await searchParams;
  const action = typeof params.action === "string" ? params.action : "";
  const entity = typeof params.entity === "string" ? params.entity : "";
  const search = typeof params.search === "string" ? params.search : "";
  const page = Math.max(1, Number.parseInt(params.page, 10) || 1);
  const { rows, total, perPage } = await listActivityLogs({ action, entityType: entity, search, page });
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const filtered = Boolean(action || entity || search);

  return (
    <>
      <PageHeader
        eyebrow="Activity Log"
        title="Riwayat Aktivitas"
        description="Catatan semua aksi Admin dan Teacher. Data yang dihapus tetap bisa dicek di sini lewat salinannya."
      />

      <form method="get" role="search" className="grid gap-3 rounded-xl border bg-card p-4 shadow-xs md:grid-cols-[1fr_12rem_12rem_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input name="search" type="search" defaultValue={search} placeholder="Cari nama data atau pelaku" aria-label="Cari riwayat" className="pl-10" />
        </div>
        <NativeSelect name="action" defaultValue={action} aria-label="Filter aksi">
          <option value="">Semua aksi</option>
          {Object.entries(ACTION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </NativeSelect>
        <NativeSelect name="entity" defaultValue={entity} aria-label="Filter jenis data">
          <option value="">Semua data</option>
          {Object.entries(ENTITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </NativeSelect>
        <Button type="submit" className="h-11">Terapkan</Button>
      </form>

      {rows.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-xl border bg-card shadow-xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Pelaku</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} className="align-top">
                    <TableCell className="whitespace-nowrap text-sm">{formatDateTime(row.created_at)}</TableCell>
                    <TableCell>
                      <p className="font-medium">{row.actor_name}</p>
                      <p className="text-xs text-muted-foreground">{ROLE_LABELS[row.actor_role] ?? row.actor_role}</p>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${ACTION_STYLES[row.action] ?? ""}`}>
                        {ACTION_LABELS[row.action] ?? row.action}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{row.entity_label}</p>
                      <p className="text-xs text-muted-foreground">{ENTITY_LABELS[row.entity_type] ?? row.entity_type}</p>
                    </TableCell>
                    <TableCell className="min-w-64 max-w-md whitespace-normal">
                      <DetailList details={row.details} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={Math.min(page, totalPages)} totalPages={totalPages} basePath="/admin/activity-logs" params={{ action, entity, search }} />
        </>
      ) : (
        <EmptyState
          icon={History}
          title={filtered ? "Riwayat tidak ditemukan" : "Belum ada aktivitas"}
          description={filtered ? "Ubah kata kunci atau filter." : "Setiap aksi Admin dan Teacher akan tercatat di sini."}
        />
      )}
    </>
  );
}
