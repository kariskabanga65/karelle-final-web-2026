import Link from "next/link";
import { Bell } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read-button";
import { NotificationItem } from "@/components/notifications/notification-item";
import { EmptyState } from "@/components/shared/empty-state";
import { requireUser } from "@/lib/auth/session";
import { countUnreadNotifications, listNotifications } from "@/lib/db/queries/notifications";
import { cn } from "@/lib/utils/cn";

export const metadata = { title: "Notifikasi | KARÉLLE" };

export default async function NotificationsPage({ searchParams }) {
  const user = await requireUser();
  const { filter } = await searchParams;
  const unreadOnly = filter === "unread";
  const [notifications, unread] = await Promise.all([
    listNotifications(user.id, { unreadOnly, limit: 100 }),
    countUnreadNotifications(user.id),
  ]);

  return (
    <DashboardShell user={user}>
      <PageHeader eyebrow="Notifications" title="Notifikasi" description={unread > 0 ? `${unread} notifikasi belum dibaca.` : "Semua notifikasi sudah dibaca."}>
        <MarkAllReadButton disabled={unread === 0} />
      </PageHeader>

      <nav aria-label="Filter notifikasi" className="flex gap-2">
        {[
          { href: "/notifications", label: "Semua", active: !unreadOnly },
          { href: "/notifications?filter=unread", label: `Belum dibaca (${unread})`, active: unreadOnly },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={tab.active ? "page" : undefined}
            className={cn("rounded-full border px-4 py-2 text-sm", tab.active ? "border-ink bg-ink text-white" : "bg-card hover:border-ink")}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {notifications.length > 0 ? (
        <div className="max-w-3xl space-y-1 rounded-xl border bg-card p-2 shadow-xs">
          {notifications.map((item) => <NotificationItem key={item.id} notification={item} />)}
        </div>
      ) : (
        <EmptyState icon={Bell} title={unreadOnly ? "Tidak ada notifikasi baru" : "Belum ada notifikasi"} description="Notifikasi tentang kelas, diskusi, dan akun Anda akan muncul di sini." />
      )}
    </DashboardShell>
  );
}
