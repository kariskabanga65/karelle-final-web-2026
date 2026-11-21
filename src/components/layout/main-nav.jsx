"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { NAV_LINKS } from "./nav-links";

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi utama" className="hidden items-center gap-10 lg:flex">
      {NAV_LINKS.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href) && !link.href.includes("#");
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative py-2 text-sm text-white/80 transition-colors hover:text-white",
              active && "text-white after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-white",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
