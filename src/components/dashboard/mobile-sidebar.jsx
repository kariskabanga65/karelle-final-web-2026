"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";

export function MobileSidebar({ role, roleLabel, badges, showLearning = false }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Buka menu dashboard">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="border-ink-border bg-ink text-white">
        <SheetHeader className="border-b border-ink-border">
          <SheetTitle className="font-display text-2xl tracking-[0.25em] text-white">KARÉLLE</SheetTitle>
          <SheetDescription className="text-white/60">Panel {roleLabel}</SheetDescription>
        </SheetHeader>
        <div className="px-3">
          <SidebarNav role={role} badges={badges} showLearning={showLearning} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
