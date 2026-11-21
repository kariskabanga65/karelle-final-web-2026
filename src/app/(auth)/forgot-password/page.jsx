import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forms/password-forms";

export const metadata = { title: "Lupa Password | KARÉLLE" };

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Lupa password</h1>
        <p className="text-sm text-neutral-500">Masukkan email akun Anda untuk membuat tautan reset password.</p>
      </div>
      <ForgotPasswordForm />
      <p className="text-center text-sm">
        <Link href="/login" className="text-[#7a1f3d] hover:underline">Kembali ke halaman masuk</Link>
      </p>
    </div>
  );
}
