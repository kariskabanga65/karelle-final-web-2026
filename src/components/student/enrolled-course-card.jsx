import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDate, formatPercent, getCategoryImage } from "@/lib/utils/format";

/** Kartu kelas yang diikuti student, dengan progress & tombol Lanjutkan. */
export function EnrolledCourseCard({ course }) {
  const percent = Number(course.progress_percent);
  const done = course.status === "completed";
  const notStarted = course.not_started;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-xs sm:flex-row">
      <div className="relative aspect-[16/9] shrink-0 bg-ink sm:aspect-auto sm:w-56">
        <Image
          src={course.thumbnail_url || getCategoryImage(course.category_slug)}
          alt=""
          fill
          sizes="(min-width: 640px) 224px, 100vw"
          className="object-cover grayscale transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{course.category_name}</Badge>
            {done && <Badge variant="success"><CheckCircle2 /> Selesai</Badge>}
            {notStarted && <Badge variant="warning">Mulai {formatDate(course.start_date)}</Badge>}
          </div>
          <h3 className="font-display text-2xl leading-tight">{course.title}</h3>
          <p className="text-sm text-muted-foreground">bersama {course.teacher_name}</p>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{course.completed_lessons}/{course.total_lessons} materi selesai</span>
            <span className="font-medium">{formatPercent(percent)}</span>
          </div>
          <Progress value={percent} aria-label={`Progress ${course.title}`} />
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {done
              ? `Selesai ${formatDate(course.completed_at)}`
              : course.next_lesson_title
                ? <>Berikutnya: <span className="font-medium text-foreground">{course.next_lesson_title}</span></>
                : "Belum ada materi"}
          </p>
          <div className="flex gap-2">
            {done ? (
              <Button asChild variant="outline" size="sm"><Link href="/student/certificates"><Award /> Sertifikat</Link></Button>
            ) : (
              <Button asChild variant="ghost" size="sm"><Link href={`/courses/${course.slug}`}>Detail</Link></Button>
            )}
            {course.total_lessons > 0 && (
              <Button asChild size="sm">
                <Link href={`/student/learn/${course.course_id}`}>
                  {done ? "Buka lagi" : percent > 0 ? "Lanjutkan" : "Mulai belajar"} <ArrowRight />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
