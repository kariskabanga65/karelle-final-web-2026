import Link from "next/link";
import { RegisterForm } from "@/components/forms/register-form";
import { getAllCategories } from "@/lib/db/queries/categories";

export const metadata = { title: "Daftar sebagai Teacher | KARÉLLE" };

export default async function RegisterTeacherPage() {
  const categories = await getAllCategories();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Daftar sebagai Teacher</h1>
        <p className="text-sm text-neutral-500">
          Akun Anda langsung aktif sebagai Student. Akses Teacher diberikan setelah Admin menyetujui pengajuan.
        </p>
      </div>
      <RegisterForm variant="teacher" categories={categories} />
      <p className="text-center text-sm text-neutral-600">
        Sudah punya akun? <Link href="/login" className="font-medium text-[#7a1f3d] hover:underline">Masuk</Link>
      </p>
    </div>
  );
}
