import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardPath, ROLE_LABELS } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { Logo } from "./logo";
import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";

export async function SiteHeader({ overlay = false }) {
  const user = await getCurrentUser();
  const dashboardPath = user ? getDashboardPath(user.role) : "/login";
  const safeUser = user ? { name: user.name, email: user.email } : null;

  return (
    <header className={cn("z-40 w-full text-white", overlay ? "absolute inset-x-0 top-0" : "sticky top-0 bg-ink")}>
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
    </header>
  );
}
