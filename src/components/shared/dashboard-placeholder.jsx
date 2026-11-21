import Link from "next/link";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { LogoutButton } from "./logout-button";

export function DashboardPlaceholder({ user, title, stage }) {
  return (
    <main className="min-h-screen bg-[#f7f1e8] px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6 rounded-xl bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-widest text-[#b08d57]">KARÉLLE</p>
            <h1 className="text-2xl font-semibold">{title}</h1>
          </div>
          <LogoutButton />
        </div>
        <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
          <dt className="text-neutral-500">Nama</dt>
          <dd>{user.name}</dd>
          <dt className="text-neutral-500">Username</dt>
          <dd>{user.username}</dd>
          <dt className="text-neutral-500">Email</dt>
          <dd>{user.email}</dd>
          <dt className="text-neutral-500">Role</dt>
          <dd className="font-medium text-[#7a1f3d]">{ROLE_LABELS[user.role]}</dd>
        </dl>
        <p className="rounded-md bg-[#f7f1e8] px-3 py-2 text-sm text-neutral-600">
          Halaman ini masih sementara dan akan dibangun lengkap pada {stage}.
        </p>
        <Link href="/profile" className="text-sm font-medium text-[#7a1f3d] hover:underline">
          Lihat profil
        </Link>
      </div>
    </main>
  );
}
