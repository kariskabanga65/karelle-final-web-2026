"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { enrollCourseAction } from "@/actions/enrollment-actions";
import { Button } from "@/components/ui/button";

export function EnrollButton({ courseId, className, size }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleEnroll() {
    startTransition(async () => {
      const result = await enrollCourseAction(courseId);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button onClick={handleEnroll} disabled={pending} className={className} size={size}>
      {pending ? <Loader2 className="animate-spin" /> : <Plus />}
      {pending ? "Mendaftarkan..." : "Ikuti Course"}
    </Button>
  );
}
