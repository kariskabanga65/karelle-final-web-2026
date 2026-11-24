"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HAS_PREVIOUS_PAGE_KEY } from "@/components/shared/navigation-tracker";


export function BackLink({ fallbackHref = "/", fallbackLabel = "Kembali ke beranda", className }) {
  const router = useRouter();
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

  if (!canGoBack) {
    return (
      <Link href={fallbackHref} className={className}>
        {fallbackLabel}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => router.back()} className={className}>
      Kembali ke halaman sebelumnya
    </button>
  );
}
