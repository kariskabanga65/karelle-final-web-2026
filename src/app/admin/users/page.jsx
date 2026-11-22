import Link from "next/link";
import { Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { deleteUserAction } from "@/actions/user-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { AccountStatusBadge, RoleBadge } from "@/components/dashboard/user-badges";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { EmptyState } from "@/components/shared/empty-state";
import { FlashToast } from "@/components/shared/flash-toast";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { listUsers } from "@/lib/db/queries/users";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "Users | Admin KARÉLLE" };

const FLASH = { created: "User baru berhasil dibuat.", updated: "Perubahan user disimpan." };

export default async function AdminUsersPage({ searchParams }) {
  const admin = await requireRole(ROLES.ADMIN);
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const role = typeof params.role === "string" ? params.role : "";
  const status = typeof params.status === "string" ? params.status : "";
  const page = Math.max(1, Number.parseInt(params.page, 10) || 1);

  const { users, total, totalPages } = await listUsers({ search, role, status, page });
  const filtered = Boolean(search || role || status);

  return (
    <>
      <FlashToast message={FLASH[params.success]} />
      <PageHeader eyebrow="User Management" title="Users" description={`${total} pengguna terdaftar${filtered ? " sesuai filter" : ""}.`}>
        <Button asChild><Link href="/admin/users/new"><Plus /> Tambah user</Link></Button>
      </PageHeader>

      <form method="get" role="search" className="grid gap-3 rounded-xl border bg-card p-4 shadow-xs sm:grid-cols-[1fr_10rem_11rem_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="search" type="search" defaultValue={search} placeholder="Cari nama, username, atau email" aria-label="Cari user" className="pl-10" />
        </div>
        <NativeSelect name="role" defaultValue={role} aria-label="Filter role">
          <option value="">Semua role</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </NativeSelect>
        <NativeSelect name="status" defaultValue={status} aria-label="Filter status pengajuan">
          <option value="">Semua status</option>
          <option value="pending">Pending Teacher</option>
          <option value="approved">Teacher disetujui</option>
          <option value="rejected">Pengajuan ditolak</option>
        </NativeSelect>
        <div className="flex gap-2">
          <Button type="submit" className="h-11 flex-1">Terapkan</Button>
          {filtered && <Button asChild variant="ghost" className="h-11"><Link href="/admin/users">Reset</Link></Button>}
        </div>
      </form>

      {users.length > 0 ? (
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created at</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <p className="font-medium">@{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.name}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell><RoleBadge role={user.role} /></TableCell>
                  <TableCell><AccountStatusBadge role={user.role} applicationStatus={user.application_status} /></TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(user.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/users/${user.id}/edit`} aria-label={`Edit ${user.name}`}><Pencil /> Edit</Link>
                      </Button>
                      {user.id !== admin.id && (
                        <ConfirmActionButton
                          action={deleteUserAction.bind(null, user.id)}
                          title="Hapus user?"
                          description={`Akun ${user.name} (@${user.username}) beserta enrollment, progress, dan komentarnya akan dihapus permanen.`}
                          triggerClassName="text-destructive hover:text-destructive"
                        >
                          <Trash2 /> Hapus
                        </ConfirmActionButton>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState icon={Users} title="User tidak ditemukan" description="Coba ubah kata kunci atau filter." />
      )}

      <Pagination page={Math.min(page, totalPages)} totalPages={totalPages} basePath="/admin/users" params={{ search, role, status }} />
    </>
  );
}
