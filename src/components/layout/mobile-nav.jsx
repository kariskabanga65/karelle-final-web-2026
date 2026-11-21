"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { logoutAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAV_LINKS } from "./nav-links";

export function MobileNav({ user, dashboardPath }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white lg:hidden" aria-label="Buka menu">
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="border-ink-border bg-ink text-white">
        <SheetHeader className="border-b border-ink-border">
          <SheetTitle className="font-display text-2xl tracking-[0.25em] text-white">KARÉLLE</SheetTitle>
          <SheetDescription className="text-white/60">Modeling Course</SheetDescription>
        </SheetHeader>
        <nav aria-label="Navigasi mobile" className="flex flex-col px-5">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={close} className="border-b border-ink-border py-4 font-display text-xl">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3 p-5">
          {user ? (
            <>
              <Button asChild variant="light">
                <Link href={dashboardPath} onClick={close}>Dashboard</Link>
              </Button>
              <Button asChild variant="outline-light">
                <Link href="/profile" onClick={close}>Profil saya</Link>
              </Button>
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" className="w-full text-white/70 hover:bg-white/10 hover:text-white">
                  Keluar
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="light">
                <Link href="/register/student" onClick={close}>Register</Link>
              </Button>
              <Button asChild variant="outline-light">
                <Link href="/login" onClick={close}>Login</Link>
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
