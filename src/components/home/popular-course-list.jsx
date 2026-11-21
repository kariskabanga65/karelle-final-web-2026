import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatPercent, getCategoryImage } from "@/lib/utils/format";

export function PopularCourseList({ courses, enrollments }) {
  return (
    <ol className="divide-y border-y">
      {courses.map((course, index) => {
        const enrollment = enrollments.get(course.id);
        return (
          <li key={course.id}>
            <Link href={`/courses/${course.slug}`} className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 py-6 sm:grid-cols-[3rem_6rem_1fr_auto] sm:gap-8">
              <span className="font-display text-3xl text-muted-foreground/70 italic max-sm:hidden">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="relative block size-20 overflow-hidden rounded-lg bg-ink sm:h-24 sm:w-24">
                <Image src={course.thumbnail_url || getCategoryImage(course.category_slug)} alt="" fill sizes="96px" className="object-cover object-top" />
              </span>
              <span className="min-w-0 space-y-2">
                <Badge variant="outline">{course.category_name}</Badge>
                <span className="block font-display text-2xl leading-tight group-hover:underline group-hover:underline-offset-4 sm:text-3xl">
                  {course.title}
                </span>
                <span className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                  <span>{course.teacher_name}</span>
                  <span className="flex items-center gap-1"><BookOpen className="size-3.5" /> {course.content_count} materi</span>
                  <span className="flex items-center gap-1"><Users className="size-3.5" /> {course.student_count} student</span>
                </span>
                {enrollment && (
                  <span className="flex max-w-xs items-center gap-3 text-xs">
                    <Progress value={enrollment.progress} className="flex-1" aria-label="Progress belajar" />
                    {formatPercent(enrollment.progress)}
                  </span>
                )}
              </span>
              <span className="flex size-11 items-center justify-center rounded-full border transition-colors group-hover:bg-ink group-hover:text-white max-sm:hidden">
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
