import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getDashboardPath, ROLE_LABELS } from "@/lib/auth/roles";
import { getLatestTeacherApplication } from "@/lib/db/queries/teacher-applications";
import { LogoutButton } from "@/components/shared/logout-button";

export const metadata = { title: "Profil | KARÉLLE" };

/**
 * Profil pengguna (versi awal). Bagian course yang diikuti/diajarkan
 * ditambahkan di Tahap 6 dan 7.
 *
 * Notifikasi Welcome Teacher dihitung di Server Component ini:
 * muncul hanya jika approved_at kurang dari 24 jam yang lalu.
 */
export default async function ProfilePage() {
  const user = await requireUser();
  const application = await getLatestTeacherApplication(user.id);

  const isPending = application?.status === "pending";
  const isRejected = application?.status === "rejected" && user.role === "student";
  const showWelcomeTeacher = user.role === "teacher" && application?.is_newly_approved;

  return (
    <main className="min-h-screen bg-[#f7f1e8] px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6 rounded-xl bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold">Profil Saya</h1>
          <LogoutButton />
        </div>

        {showWelcomeTeacher && (
          <div role="status" className="rounded-md border border-[#b08d57] bg-[#fbf6ec] px-4 py-3 text-sm">
            <p className="font-semibold text-[#7a1f3d]">Selamat datang, Teacher! 🎉</p>
            <p>Pengajuan Anda telah disetujui Admin. Sekarang Anda dapat membuat course.</p>
          </div>
        )}

        {isPending && (
          <div role="status" className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Akun pengajar Anda sedang menunggu verifikasi Admin.
          </div>
        )}

        {isRejected && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Pengajuan Teacher Anda ditolak.
            {application.rejection_reason && <> Alasan: {application.rejection_reason}</>}
          </div>
        )}

        <dl className="grid grid-cols-[140px_1fr] gap-y-2 text-sm">
          <dt className="text-neutral-500">Nama</dt>
          <dd>{user.name}</dd>
          <dt className="text-neutral-500">Username</dt>
          <dd>{user.username}</dd>
          <dt className="text-neutral-500">Email</dt>
          <dd>{user.email}</dd>
          <dt className="text-neutral-500">Role</dt>
          <dd className="font-medium text-[#7a1f3d]">{ROLE_LABELS[user.role]}</dd>
          <dt className="text-neutral-500">Status akun</dt>
          <dd>{isPending ? "Aktif · Pengajuan Teacher pending" : "Aktif"}</dd>
        </dl>

        <Link href={getDashboardPath(user.role)} className="text-sm font-medium text-[#7a1f3d] hover:underline">
          Ke dashboard
        </Link>
      </div>
    </main>
  );
}
