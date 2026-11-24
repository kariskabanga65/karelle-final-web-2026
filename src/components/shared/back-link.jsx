"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HAS_PREVIOUS_PAGE_KEY } from "@/components/shared/navigation-tracker";

/**
 * true jika di tab ini user sudah berpindah halaman di dalam KARÉLLE,
 * sehingga "kembali" tetap berada di aplikasi. Tab baru, scan QR, atau
 * URL yang diketik langsung menghasilkan false.
 */
function useCanGoBack() {
  const [canGoBack, setCanGoBack] = useState(false);

  // sessionStorage dan riwayat browser hanya bisa dibaca di browser.
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

/** Link teks "kembali"; jika tidak ada halaman sebelumnya, menuju halaman cadangan. */
export function BackLink({ fallbackHref = "/", fallbackLabel = "Kembali ke beranda", className }) {
  const router = useRouter();
  const canGoBack = useCanGoBack();

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

/** Tombol panah kembali untuk header dashboard; tidak tampil jika tidak ada halaman sebelumnya. */
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
