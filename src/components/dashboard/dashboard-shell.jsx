import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { UserMenu } from "@/components/layout/user-menu";
import { getDashboardPath, ROLE_LABELS } from "@/lib/auth/roles";
import { countUnreadNotifications } from "@/lib/db/queries/notifications";
import { MobileSidebar } from "./mobile-sidebar";
import { SidebarNav } from "./sidebar-nav";

export async function DashboardShell({ user, badges = {}, children }) {
  const roleLabel = ROLE_LABELS[user.role];
  const allBadges = { ...badges, unreadNotifications: await countUnreadNotifications(user.id) };
  const safeUser = { name: user.name, email: user.email, image: user.image ?? null };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-8 bg-ink px-4 py-6 text-white lg:flex">
        <Logo className="px-2" />
        <div className="space-y-3">
          <p className="px-3 text-[0.65rem] tracking-[0.35em] text-white/40 uppercase">Panel {roleLabel}</p>
          <SidebarNav role={user.role} badges={allBadges} />
        </div>
        <Link href="/" className="mt-auto flex items-center gap-2 px-3 text-sm text-white/55 hover:text-white">
          <ExternalLink className="size-4" /> Lihat situs
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/90 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-2">
            <MobileSidebar role={user.role} roleLabel={roleLabel} badges={allBadges} />
            <span className="font-display text-xl lg:hidden">KARÉLLE</span>
          </div>
          <div className="rounded-full bg-ink">
            <UserMenu user={safeUser} dashboardPath={getDashboardPath(user.role)} roleLabel={roleLabel} />
          </div>
        </header>
        <main id="main-content" className="flex-1 px-4 py-8 sm:px-8 lg:py-10">
          <div className="mx-auto max-w-6xl space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
