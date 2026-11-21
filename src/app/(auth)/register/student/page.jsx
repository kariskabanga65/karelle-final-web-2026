import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata = { title: "Create Account | KARÉLLE" };

export default function RegisterStudentPage() {
  return (
    <div className="space-y-7">
      <Logo variant="full" className="mx-auto w-48" />
      <div className="space-y-2 text-center">
        <h1 className="font-display text-4xl italic">Create Account</h1>
        <p className="text-white/75">Daftar sebagai Student dan mulai belajar dari para profesional.</p>
      </div>
      <RegisterForm variant="student" />
      <p className="text-center text-sm text-white/70">
        Sudah punya akun? <Link href="/login" className="font-medium text-white underline underline-offset-4">Log in</Link>
        {" · "}
        <Link href="/register/teacher" className="font-medium text-white underline underline-offset-4">Daftar sebagai Teacher</Link>
      </p>
    </div>
  );
}
