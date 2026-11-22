import { redirect } from "next/navigation";
import { Ribbon } from "@/components/layout/ribbon";
import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardPath } from "@/lib/auth/roles";

// User yang sudah login tidak perlu melihat halaman login/register lagi.
export default async function AuthLayout({ children }) {
  const user = await getCurrentUser();
  if (user) redirect(getDashboardPath(user.role));

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,#5e5e5e_0%,#272727_48%,#0b0b0b_100%)] text-white">
      <Ribbon className="-top-16 -left-24 w-[520px] opacity-80" />
      <Ribbon flip className="-right-16 -bottom-24 w-[560px] opacity-70" />

      {/* Kartu form di tengah layar */}
      <main id="main-content" className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        {children}
      </main>
    </div>
  );
}
