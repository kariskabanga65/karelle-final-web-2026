import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardPath } from "@/lib/auth/roles";

// User yang sudah login tidak perlu melihat halaman login/register lagi.
export default async function AuthLayout({ children }) {
  const user = await getCurrentUser();
  if (user) redirect(getDashboardPath(user.role));

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f1e8] px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-sm">
        <Link href="/" className="block text-center text-2xl font-semibold tracking-[0.2em] text-[#7a1f3d]">
          KARÉLLE
        </Link>
        {children}
      </div>
    </main>
  );
}
