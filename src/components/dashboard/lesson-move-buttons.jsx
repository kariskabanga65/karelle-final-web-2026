"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function LessonMoveButtons({ moveUp, moveDown, isFirst, isLast, title }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const move = (action) =>
    startTransition(async () => {
      const result = await action();
      if (result?.success) router.refresh();
      else toast.error(result?.error ?? "Gagal mengubah urutan materi.");
    });

  return (
    <div className="flex flex-col">
      <Button type="button" variant="ghost" size="icon" className="size-7" disabled={isFirst || pending} onClick={() => move(moveUp)} aria-label={`Naikkan ${title}`}>
        <ArrowUp className="size-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="size-7" disabled={isLast || pending} onClick={() => move(moveDown)} aria-label={`Turunkan ${title}`}>
        <ArrowDown className="size-4" />
      </Button>
    </div>
  );
}
