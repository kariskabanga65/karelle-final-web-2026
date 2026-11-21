import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { ForgotPasswordForm } from "@/components/forms/password-forms";

export const metadata = { title: "Forgot Password | KARÉLLE" };

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-7">
      <Logo variant="full" className="mx-auto w-48" />
      <div className="space-y-2 text-center">
        <h1 className="font-display text-4xl italic">Forgot Password</h1>
        <p className="text-white/75">Masukkan email akun Anda untuk membuat tautan reset password.</p>
      </div>
      <ForgotPasswordForm />
      <p className="text-center text-sm">
        <Link href="/login" className="text-white/80 underline underline-offset-4 hover:text-white">Kembali ke halaman login</Link>
      </p>
    </div>
  );
}
