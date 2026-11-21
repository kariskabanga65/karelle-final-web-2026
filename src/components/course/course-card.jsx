import Image from "next/image";
import Link from "next/link";
import { BookOpen, CalendarDays, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCoursePeriod, getCategoryImage } from "@/lib/utils/format";
import { CourseActions } from "./course-actions";

export function CourseCard({ course, viewer, enrollment }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-xs transition-shadow hover:shadow-md">
      <Link href={`/courses/${course.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-ink">
        <Image
          src={course.thumbnail_url || getCategoryImage(course.category_slug)}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-top opacity-90 transition-transform duration-500 group-hover:scale-105"
        />
        <Badge className="absolute top-4 left-4 bg-white/90 text-ink">{course.category_name}</Badge>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-2">
          <h3 className="font-display text-2xl leading-tight">
            <Link href={`/courses/${course.slug}`} className="hover:underline hover:underline-offset-4">
              {course.title}
            </Link>
          </h3>
          <p className="text-sm text-muted-foreground">
            oleh <span className="font-medium text-foreground">{course.teacher_name}</span>
            {course.teacher_headline && <> · {course.teacher_headline}</>}
          </p>
        </div>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{course.description}</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5"><BookOpen className="size-3.5" /> {course.content_count} materi</li>
          <li className="flex items-center gap-1.5"><Users className="size-3.5" /> {course.student_count} student</li>
          <li className="flex items-center gap-1.5"><CalendarDays className="size-3.5" /> {formatCoursePeriod(course.start_date, course.end_date)}</li>
        </ul>
        <div className="mt-auto border-t pt-5">
          <CourseActions course={course} viewer={viewer} enrollment={enrollment} />
        </div>
      </div>
    </article>
  );
}
