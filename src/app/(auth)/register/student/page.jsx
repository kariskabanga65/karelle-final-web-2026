import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { AuthCard } from "@/components/layout/auth-card";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata = { title: "Create Account | KARÉLLE" };

export default function RegisterStudentPage() {
  return (
    <AuthCard size="lg" className="grid gap-8 lg:grid-cols-[17rem_1fr] lg:gap-12">
      {/* Kiri: identitas & judul */}
      <div className="flex flex-col justify-center gap-6 text-center lg:border-r lg:border-white/15 lg:pr-12">
        <Logo variant="full" className="mx-auto w-44" />
        <div className="space-y-2">
          <h1 className="font-display text-4xl italic">Create Account</h1>
          <p className="text-white/75">Daftar sebagai Student dan mulai belajar dari para profesional.</p>
        </div>
        <p className="text-sm text-white/70">
          Sudah punya akun? <Link href="/login" className="font-medium text-white underline underline-offset-4">Log in</Link>
          <br />
          <Link href="/register/teacher" className="font-medium text-white underline underline-offset-4">Daftar sebagai Teacher</Link>
        </p>
      </div>

      {/* Kanan: form dua kolom */}
      <RegisterForm variant="student" />
    </AuthCard>
  );
}
