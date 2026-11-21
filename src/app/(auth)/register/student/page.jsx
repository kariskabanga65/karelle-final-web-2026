import Link from "next/link";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata = { title: "Daftar sebagai Student | KARÉLLE" };

export default function RegisterStudentPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Daftar sebagai Student</h1>
        <p className="text-sm text-neutral-500">Mulai belajar modeling dari para profesional.</p>
      </div>
      <RegisterForm variant="student" />
      <p className="text-center text-sm text-neutral-600">
        Sudah punya akun? <Link href="/login" className="font-medium text-[#7a1f3d] hover:underline">Masuk</Link>
      </p>
    </div>
  );
}
