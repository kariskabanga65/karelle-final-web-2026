"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HAS_PREVIOUS_PAGE_KEY } from "@/components/shared/navigation-tracker";

function useCanGoBack() {
  const [canGoBack, setCanGoBack] = useState(false);
  useEffect(() => {
    let visitedBefore = false;
    try {
      visitedBefore = sessionStorage.getItem(HAS_PREVIOUS_PAGE_KEY) === "1";
    } catch {
      visitedBefore = false;
    }
    setCanGoBack(visitedBefore && window.history.length > 1);
  }, []);

  return canGoBack;
}

export function BackLink({
  fallbackHref = "/",
  fallbackLabel = "Kembali ke beranda",
  backLabel = "Kembali ke halaman sebelumnya",
  showIcon = false,
  className,
}) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const icon = showIcon ? <ArrowLeft className="size-4" aria-hidden /> : null;

  if (!canGoBack) {
    return (
      <Link href={fallbackHref} className={className}>
        {icon}
        {fallbackLabel}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => router.back()} className={className}>
      {icon}
      {backLabel}
    </button>
  );
}

export function BackButton({ className }) {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  if (!canGoBack) return null;

  return (
    <Button type="button" variant="ghost" size="sm" onClick={() => router.back()} className={className}>
      <ArrowLeft aria-hidden />
      <span className="hidden sm:inline">Kembali</span>
      <span className="sr-only sm:hidden">Kembali ke halaman sebelumnya</span>
    </Button>
  );
}
