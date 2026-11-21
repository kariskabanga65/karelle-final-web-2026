import Link from "next/link";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { LogoutButton } from "./logout-button";

/**
 * Tampilan sementara untuk dashboard yang baru dibangun di tahap
 * berikutnya. Dipakai untuk menguji login, redirect, dan RBAC.
 */
export function DashboardPlaceholder({ user, title, stage }) {
  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6 rounded-xl bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-widest text-muted-foreground">KARÉLLE</p>
            <h1 className="text-2xl font-semibold">{title}</h1>
          </div>
          <LogoutButton />
        </div>
        <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
          <dt className="text-muted-foreground">Nama</dt>
          <dd>{user.name}</dd>
          <dt className="text-muted-foreground">Username</dt>
          <dd>{user.username}</dd>
          <dt className="text-muted-foreground">Email</dt>
          <dd>{user.email}</dd>
          <dt className="text-muted-foreground">Role</dt>
          <dd className="font-medium text-foreground underline-offset-4">{ROLE_LABELS[user.role]}</dd>
        </dl>
        <p className="rounded-md bg-background px-3 py-2 text-sm text-muted-foreground">
          Halaman ini masih sementara dan akan dibangun lengkap pada {stage}.
        </p>
        <Link href="/profile" className="text-sm font-medium text-foreground underline-offset-4 hover:underline">
          Lihat profil
        </Link>
      </div>
    </main>
  );
}
