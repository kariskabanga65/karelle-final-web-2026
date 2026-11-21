import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { ResetPasswordForm } from "@/components/forms/password-forms";

export const metadata = { title: "Reset Password | KARÉLLE" };

export default async function ResetPasswordPage({ searchParams }) {
  const { token, error } = await searchParams;

  return (
    <div className="space-y-7">
      <Logo variant="full" className="mx-auto w-48" />
      {!token || error ? (
        <div className="space-y-4 text-center">
          <h1 className="font-display text-4xl italic">Tautan tidak valid</h1>
          <p className="text-white/75">Tautan reset password tidak valid atau sudah kedaluwarsa.</p>
          <Link href="/forgot-password" className="text-sm font-medium underline underline-offset-4">Minta tautan baru</Link>
        </div>
      ) : (
        <>
          <h1 className="text-center font-display text-4xl italic">New Password</h1>
          <ResetPasswordForm token={token} />
        </>
      )}
    </div>
  );
}
