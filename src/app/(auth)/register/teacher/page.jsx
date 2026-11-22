import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { AuthCard } from "@/components/layout/auth-card";
import { RegisterForm } from "@/components/forms/register-form";
import { getAllCategories } from "@/lib/db/queries/categories";

export const metadata = { title: "Join as Teacher | KARÉLLE" };

export default async function RegisterTeacherPage() {
  const categories = await getAllCategories();

  return (
    <AuthCard size="lg" className="grid gap-8 lg:grid-cols-[17rem_1fr] lg:gap-12">
      {/* Kiri: identitas & judul */}
      <div className="flex flex-col justify-center gap-6 text-center lg:border-r lg:border-white/15 lg:pr-12">
        <Logo variant="full" className="mx-auto w-44" />
        <div className="space-y-2">
          <h1 className="font-display text-4xl italic">Join as Teacher</h1>
          <p className="text-white/75">
            Akun Anda langsung aktif sebagai Student. Akses Teacher diberikan setelah Admin menyetujui pengajuan.
          </p>
        </div>
        <p className="text-sm text-white/70">
          Sudah punya akun? <Link href="/login" className="font-medium text-white underline underline-offset-4">Log in</Link>
        </p>
      </div>

      {/* Kanan: form dua kolom */}
      <RegisterForm variant="teacher" categories={categories} />
    </AuthCard>
  );
}
