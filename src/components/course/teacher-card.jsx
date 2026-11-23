import Image from "next/image";
import Link from "next/link";
import { getInitials } from "@/lib/utils/format";

export function TeacherCard({ teacher, showCourses = false }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-xs">
      <div className="relative aspect-[4/3] overflow-hidden bg-ink">
        {teacher.image ? (
          <Image
            src={teacher.image}
            alt={`Foto ${teacher.name}`}
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
            className="object-cover grayscale transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <span aria-hidden className="absolute inset-0 grid place-items-center font-display text-6xl text-white/80">
            {getInitials(teacher.name)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-5 p-7">
        <div>
          <h3 className="font-display text-2xl leading-tight">{teacher.name}</h3>
          <p className="text-sm text-muted-foreground">{teacher.headline ?? "Instruktur KARÉLLE"}</p>
        </div>
        {teacher.bio && <p className="text-sm leading-relaxed text-muted-foreground">{teacher.bio}</p>}
        <dl className="grid grid-cols-2 gap-3 border-y py-4 text-center">
          <div>
            <dt className="text-xs text-muted-foreground">Course</dt>
            <dd className="font-display text-2xl">{teacher.course_count}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Student</dt>
            <dd className="font-display text-2xl">{teacher.student_count}</dd>
          </div>
        </dl>
        {showCourses && teacher.courses.length > 0 && (
          <ul className="space-y-2 text-sm">
            {teacher.courses.map((course) => (
              <li key={course.slug}>
                <Link href={`/courses/${course.slug}`} className="underline-offset-4 hover:underline">{course.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
