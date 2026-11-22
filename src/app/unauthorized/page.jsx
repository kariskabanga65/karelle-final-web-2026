import Link from "next/link";

export const metadata = { title: "Akses Ditolak | KARÉLLE" };

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <p className="text-sm font-semibold tracking-widest text-muted-foreground">403</p>
      <h1 className="text-2xl font-semibold">Akses ditolak</h1>
      <p className="max-w-md text-muted-foreground">Akun Anda tidak memiliki izin untuk membuka halaman tersebut.</p>
      <Link href="/dashboard" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
        Kembali ke dashboard
      </Link>
    </main>
  );
}
