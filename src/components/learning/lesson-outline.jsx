"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";


export function LessonOutline({ courseId, lessons, locked = false, onNavigate }) {
  const { contentId } = useParams();

  return (
    <nav aria-label="Daftar materi">
      <ol className="space-y-1">
        {lessons.map((lesson) => {
          const current = lesson.id === contentId;
          const Icon = locked ? Lock : lesson.completed ? CheckCircle2 : Circle;
          return (
            <li key={lesson.id}>
              <Link
                href={`/student/learn/${courseId}/${lesson.id}`}
                onClick={onNavigate}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-white/8",
                  current ? "bg-white text-ink hover:bg-white" : "text-white/75",
                )}
              >
                <Icon
                  className={cn("mt-0.5 size-4 shrink-0", lesson.completed && !current && "text-white", !lesson.completed && !current && "text-white/35")}
                  aria-hidden
                />
                <span className="flex-1">
                  <span className="mr-1.5 font-display tabular-nums opacity-80">{String(lesson.order_index).padStart(2, "0")}</span>
                  {lesson.title}
                </span>
                <span className="sr-only">{lesson.completed ? "(selesai)" : "(belum selesai)"}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
