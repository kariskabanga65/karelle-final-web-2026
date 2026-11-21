import Link from "next/link";
import { Mail } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils/format";

export function TeacherCard({ teacher, showCourses = false }) {
  return (
    <article className="flex h-full flex-col gap-5 rounded-xl border bg-card p-7 shadow-xs">
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarFallback className="bg-ink font-display text-xl text-white">{getInitials(teacher.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-display text-2xl leading-tight">{teacher.name}</h3>
          <p className="text-sm text-muted-foreground">{teacher.headline ?? "Instruktur KARÉLLE"}</p>
        </div>
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
      <a href={`mailto:${teacher.email}`} className="mt-auto inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline">
        <Mail className="size-4" /> Hubungi {teacher.name.split(" ")[0]}
      </a>
    </article>
  );
}
