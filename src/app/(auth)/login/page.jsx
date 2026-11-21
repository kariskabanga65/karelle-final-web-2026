import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";

export const metadata = { title: "Masuk | KARÉLLE" };

const NOTICES = {
  logout: "Anda berhasil keluar.",
  reset: "Password berhasil diganti. Silakan masuk dengan password baru.",
};

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const notice = Object.keys(NOTICES).find((key) => params?.[key]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Masuk ke akun Anda</h1>
        <p className="text-sm text-neutral-500">Untuk Admin, Teacher, dan Student.</p>
      </div>
      {notice && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{NOTICES[notice]}</p>}
      <LoginForm callbackUrl={params?.callbackUrl} />
      <p className="text-center text-sm text-neutral-600">
        Belum punya akun?{" "}
        <Link href="/register/student" className="font-medium text-[#7a1f3d] hover:underline">Daftar sebagai Student</Link>
        {" atau "}
        <Link href="/register/teacher" className="font-medium text-[#7a1f3d] hover:underline">Teacher</Link>
      </p>
    </div>
  );
}
