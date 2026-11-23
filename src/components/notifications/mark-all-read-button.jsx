"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { markAllNotificationsReadAction } from "@/actions/notification-actions";
import { Button } from "@/components/ui/button";

export function MarkAllReadButton({ disabled }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled || pending}
      onClick={() =>
        startTransition(async () => {
          const result = await markAllNotificationsReadAction();
          if (result?.success) toast.success(result.message);
          router.refresh();
        })
      }
    >
      <CheckCheck /> Tandai semua dibaca
    </Button>
  );
}
