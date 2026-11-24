"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export const HAS_PREVIOUS_PAGE_KEY = "karelle:has-previous-page";

export function NavigationTracker() {
  const pathname = usePathname();
  const lastPath = useRef(null);

  useEffect(() => {
    if (lastPath.current && lastPath.current !== pathname) {
      try {
        sessionStorage.setItem(HAS_PREVIOUS_PAGE_KEY, "1");
      } catch {
      }
    }
    lastPath.current = pathname;
  }, [pathname]);

  return null;
}
