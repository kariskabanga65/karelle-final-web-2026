"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, Bell, BookOpen, CheckCheck, MessageSquare, UserCheck, UserPlus, UserX } from "lucide-react";
import { markNotificationReadAction } from "@/actions/notification-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { formatRelative } from "@/lib/utils/format";

const ICONS = {
  teacher_approved: UserCheck,
  teacher_rejected: UserX,
  certificate_issued: Award,
  new_enrollment: UserPlus,
  new_comment: MessageSquare,
  system: BookOpen,
};

/** Satu notifikasi. Membuka tautannya sekaligus menandai sudah dibaca. */
export function NotificationItem({ notification, compact = false }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const Icon = ICONS[notification.type] ?? Bell;
  const unread = !notification.is_read;

  const markRead = () =>
    startTransition(async () => {
      await markNotificationReadAction(notification.id);
      router.refresh();
    });

  const body = (
    <>
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", unread ? "bg-ink text-white" : "bg-secondary")}>
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-sm", unread && "font-semibold")}>{notification.title}</span>
        <span className={cn("block text-sm text-muted-foreground", compact && "line-clamp-2")}>{notification.message}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{formatRelative(notification.created_at)}</span>
      </span>
      {unread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-ink" aria-label="Belum dibaca" />}
    </>
  );

  return (
    <div className={cn("flex items-start gap-2 rounded-lg transition-colors", unread && "bg-secondary/60")}>
      {notification.link ? (
        <Link
          href={notification.link}
          onClick={() => unread && markNotificationReadAction(notification.id)}
          className="flex min-w-0 flex-1 items-start gap-3 rounded-lg p-3 hover:bg-secondary"
        >
          {body}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-start gap-3 p-3">{body}</div>
      )}
      {unread && !compact && (
        <Button type="button" variant="ghost" size="icon" className="mt-2 mr-1 size-8" onClick={markRead} disabled={pending} aria-label="Tandai sudah dibaca" title="Tandai sudah dibaca">
          <CheckCheck className="size-4" />
        </Button>
      )}
    </div>
  );
}
