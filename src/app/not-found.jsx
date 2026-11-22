import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Halaman tidak ditemukan | KARÉLLE" };

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ink px-5 text-center text-white">
      <p className="font-display text-8xl italic">404</p>
      <h1 className="font-display text-3xl">Halaman tidak ditemukan</h1>
      <p className="max-w-md text-white/65">Halaman yang Anda cari tidak ada atau sudah dipindahkan.</p>
      <div className="flex gap-3">
        <Button asChild variant="light"><Link href="/">Ke beranda</Link></Button>
        <Button asChild variant="outline-light"><Link href="/courses">Lihat course</Link></Button>
      </div>
    </main>
  );
}
