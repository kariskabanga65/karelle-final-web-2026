import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { LoginForm } from "@/components/forms/login-form";

export const metadata = { title: "Log In | KARÉLLE" };

const NOTICES = {
  logout: "Anda berhasil keluar.",
  reset: "Password berhasil diganti. Silakan masuk dengan password baru.",
};

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const notice = Object.keys(NOTICES).find((key) => params?.[key]);

  return (
    <div className="space-y-7">
      <Logo variant="full" className="mx-auto w-60" />
      <div className="space-y-2 text-center">
        <h1 className="font-display text-4xl italic">Welcome Back</h1>
        <p className="text-white/75">Log in to continue your modeling journey.</p>
      </div>
      {notice && <p role="status" className="rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm">{NOTICES[notice]}</p>}
      <LoginForm callbackUrl={params?.callbackUrl} />
      <div className="flex items-center gap-4 text-sm text-white/70">
        <span className="h-px flex-1 bg-white/25" /> Don&apos;t have an account? <span className="h-px flex-1 bg-white/25" />
      </div>
      <div className="space-y-3 text-center">
        <Link href="/register/student" className="block rounded-full border border-white/70 py-3 font-medium transition-colors hover:bg-white hover:text-ink">
          Create Account
        </Link>
        <Link href="/register/teacher" className="inline-block text-sm text-white/70 underline-offset-4 hover:text-white hover:underline">
          Ingin mengajar? Daftar sebagai Teacher
        </Link>
      </div>
    </div>
  );
}
