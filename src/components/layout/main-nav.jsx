"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { NAV_LINKS } from "./nav-links";

/** Section homepage yang punya menu sendiri, urut dari atas ke bawah. */
const HOME_SECTIONS = ["about", "gallery"];

/** Jarak dari atas layar (di bawah navbar) yang dianggap "sedang dilihat". */
const ACTIVE_LINE = 120;

/**
 * Section homepage yang sedang terlihat ("about", "gallery"), atau null
 * jika user masih di bagian atas homepage. Hanya aktif di homepage.
 */
function useActiveHomeSection(enabled) {
  const [section, setSection] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setSection(null);
      return undefined;
    }

    function update() {
      let current = null;
      for (const id of HOME_SECTIONS) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= ACTIVE_LINE) current = id;
      }
      // Di ujung halaman, section terakhir mungkin tidak sampai ke garis aktif.
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom && document.getElementById(HOME_SECTIONS.at(-1))) current = HOME_SECTIONS.at(-1);
      setSection(current);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("hashchange", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("hashchange", update);
    };
  }, [enabled]);

  return section;
}

function isLinkActive(href, pathname, homeSection) {
  if (href === "/") return pathname === "/" && !homeSection;
  if (href.startsWith("/#")) return pathname === "/" && homeSection === href.slice(2);
  return pathname.startsWith(href);
}

export function MainNav() {
  const pathname = usePathname();
  const homeSection = useActiveHomeSection(pathname === "/");

  return (
    <nav aria-label="Navigasi utama" className="hidden items-center gap-10 lg:flex">
      {NAV_LINKS.map((link) => {
        const active = isLinkActive(link.href, pathname, homeSection);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? (link.href.startsWith("/#") ? "location" : "page") : undefined}
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
