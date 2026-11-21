import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { RegisterForm } from "@/components/forms/register-form";
import { getAllCategories } from "@/lib/db/queries/categories";

export const metadata = { title: "Join as Teacher | KARÉLLE" };

export default async function RegisterTeacherPage() {
  const categories = await getAllCategories();

  return (
    <div className="space-y-7">
      <Logo variant="full" className="mx-auto w-48" />
      <div className="space-y-2 text-center">
        <h1 className="font-display text-4xl italic">Join as Teacher</h1>
        <p className="text-white/75">
          Akun Anda langsung aktif sebagai Student. Akses Teacher diberikan setelah Admin menyetujui pengajuan.
        </p>
      </div>
      <RegisterForm variant="teacher" categories={categories} />
      <p className="text-center text-sm text-white/70">
        Sudah punya akun? <Link href="/login" className="font-medium text-white underline underline-offset-4">Log in</Link>
      </p>
    </div>
  );
}
