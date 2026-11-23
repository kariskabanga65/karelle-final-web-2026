"use client";

import { useState } from "react";
import { ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LessonOutline } from "./lesson-outline";


export function MobileOutline({ courseId, courseTitle, lessons, locked, progressLabel }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline-light" size="sm" className="lg:hidden">
          <ListOrdered /> Materi
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="border-ink-border bg-ink text-white">
        <SheetHeader className="border-b border-ink-border">
          <SheetTitle className="font-display text-2xl text-white">{courseTitle}</SheetTitle>
          <SheetDescription className="text-white/60">{progressLabel}</SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto px-3 pb-6">
          <LessonOutline courseId={courseId} lessons={lessons} locked={locked} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
