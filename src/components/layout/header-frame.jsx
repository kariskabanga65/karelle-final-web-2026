"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

/**
 * Bingkai navbar yang selalu menempel di atas layar.
 * - Homepage: transparan di atas hero, berubah hitam setelah halaman di-scroll.
 * - Halaman lain: selalu hitam.
 */
export function HeaderFrame({ children }) {
  const isHome = usePathname() === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) return undefined;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const transparent = isHome && !scrolled;

  return (
    <header
      className={cn(
        "z-50 w-full text-white transition-[background-color,box-shadow] duration-300",
        isHome ? "fixed inset-x-0 top-0" : "sticky top-0",
        transparent ? "bg-transparent" : "bg-ink/95 shadow-[0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md",
      )}
    >
      {children}
    </header>
  );
}
