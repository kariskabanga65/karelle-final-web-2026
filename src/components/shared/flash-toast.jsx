"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Menampilkan toast setelah redirect (misalnya ?success=created),
 * lalu membersihkan parameter dari URL agar toast tidak muncul lagi saat refresh.
 */
export function FlashToast({ message }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!message) return;
    toast.success(message);
    router.replace(pathname, { scroll: false });
  }, [message, pathname, router]);

  return null;
}
