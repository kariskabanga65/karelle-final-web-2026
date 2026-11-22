"use client";

import { Button } from "@/components/ui/button";

// Ditampilkan jika terjadi error tak terduga (misalnya database tidak bisa dihubungi).
export default function GlobalError({ reset }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-5 text-center">
      <p className="eyebrow">Terjadi kesalahan</p>
      <h1 className="font-display text-4xl">Maaf, halaman gagal dimuat</h1>
      <p className="max-w-md text-muted-foreground">Coba muat ulang. Jika masih gagal, pastikan PostgreSQL sudah berjalan.</p>
      <Button onClick={() => reset()}>Coba lagi</Button>
    </main>
  );
}
