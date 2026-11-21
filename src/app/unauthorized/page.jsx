import Link from "next/link";

export const metadata = { title: "Akses Ditolak | KARÉLLE" };

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f1e8] px-4 text-center">
      <p className="text-sm font-semibold tracking-widest text-[#b08d57]">403</p>
      <h1 className="text-2xl font-semibold">Akses ditolak</h1>
      <p className="max-w-md text-neutral-600">Akun Anda tidak memiliki izin untuk membuka halaman tersebut.</p>
      <Link href="/dashboard" className="rounded-md bg-[#7a1f3d] px-4 py-2 text-sm font-semibold text-white">
        Kembali ke dashboard
      </Link>
    </main>
  );
}
