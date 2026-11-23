"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { toggleLessonDoneAction } from "@/actions/learning-actions";
import { Button } from "@/components/ui/button";

export function MarkDoneButton({ courseId, contentId, completed, nextHref }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    startTransition(async () => {
      const result = await toggleLessonDoneAction(courseId, contentId, !completed);
      if (!result?.success) {
        toast.error(result?.error ?? "Gagal memperbarui progress.");
        return;
      }
      if (result.justCompleted) {
        toast.success(result.message, { description: "Progress Anda 100%. Luar biasa!", duration: 6000 });
      } else {
        toast.success(result.message, { description: `Progress course: ${result.progress}%` });
      }
      
      if (!completed && nextHref && !result.justCompleted) router.push(nextHref);
      else router.refresh();
    });
  }

  if (completed) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="size-5" aria-hidden /> Materi ini sudah selesai
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={toggle} disabled={pending}>
          <RotateCcw /> {pending ? "Memproses..." : "Batalkan tanda selesai"}
        </Button>
      </div>
    );
  }

  return (
    <Button type="button" size="lg" onClick={toggle} disabled={pending} className="rounded-sm">
      <Circle /> {pending ? "Menyimpan..." : nextHref ? "Tandai selesai & lanjut" : "Tandai selesai"}
    </Button>
  );
}
