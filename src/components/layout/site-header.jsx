import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardPath, ROLE_LABELS } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import { HeaderFrame } from "./header-frame";
import { Logo } from "./logo";
import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";

/**
 * Navbar publik. Server Component: membaca session langsung di server,
 * sehingga tombol Login/Register atau menu akun tampil sesuai status login.
 */
export async function SiteHeader() {
  const user = await getCurrentUser();
  const dashboardPath = user ? getDashboardPath(user.role) : "/login";
  // Hanya kirim data yang dibutuhkan ke komponen client.
  const safeUser = user ? { name: user.name, email: user.email, image: user.image ?? null } : null;

  return (
    <HeaderFrame>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Logo />
        <MainNav />
        <div className="flex items-center gap-3">
          {safeUser ? (
            <UserMenu user={safeUser} dashboardPath={dashboardPath} roleLabel={ROLE_LABELS[user.role]} />
          ) : (
            <div className="hidden items-center gap-3 sm:flex">
              <Button asChild variant="outline-light" className="rounded-lg">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="light" className="rounded-lg">
                <Link href="/register/student">Register</Link>
              </Button>
            </div>
          )}
          <MobileNav user={safeUser} dashboardPath={dashboardPath} />
        </div>
      </div>
    </HeaderFrame>
  );
}
