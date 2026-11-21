import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, CalendarDays, Lock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CourseActions } from "@/components/course/course-actions";
import { TeacherCard } from "@/components/course/teacher-card";
import { getCurrentUser } from "@/lib/auth/session";
import { getCourseBySlug, getCourseOutline } from "@/lib/db/queries/courses";
import { getEnrollmentMap } from "@/lib/db/queries/enrollments";
import { getTeachers } from "@/lib/db/queries/teachers";
import { formatCoursePeriod, getCategoryImage } from "@/lib/utils/format";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  return { title: course ? `${course.title} | KARÉLLE` : "Course tidak ditemukan | KARÉLLE" };
}

export default async function CourseDetailPage({ params }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const user = await getCurrentUser();
  const [outline, enrollments, teachers] = await Promise.all([
    getCourseOutline(course.id),
    getEnrollmentMap(user?.role === "student" ? user.id : null),
    getTeachers(),
  ]);
  const teacher = teachers.find((item) => item.id === course.teacher_id);
  const viewer = user ? { id: user.id, role: user.role } : null;

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <Image src={course.thumbnail_url || getCategoryImage(course.category_slug)} alt="" fill priority sizes="100vw" className="object-cover object-top opacity-25" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-5 py-16 sm:px-8 lg:py-24">
          <Link href="/courses" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="size-4" /> Kembali ke katalog
          </Link>
          <Badge className="bg-white text-ink">{course.category_name}</Badge>
          <h1 className="display-title max-w-4xl text-5xl sm:text-6xl">{course.title}</h1>
          <p className="max-w-2xl text-lg text-white/70">{course.description}</p>
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/80">
            <li className="flex items-center gap-2"><BookOpen className="size-4" /> {course.content_count} materi</li>
            <li className="flex items-center gap-2"><Users className="size-4" /> {course.student_count} student</li>
            <li className="flex items-center gap-2"><CalendarDays className="size-4" /> {formatCoursePeriod(course.start_date, course.end_date)}</li>
          </ul>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_22rem]">
        <section aria-labelledby="outline-title" className="space-y-6">
          <h2 id="outline-title" className="font-display text-4xl">Silabus</h2>
          {outline.length > 0 ? (
            <ol className="divide-y rounded-xl border bg-card">
              {outline.map((item) => (
                <li key={item.id} className="flex items-center gap-5 px-6 py-5">
                  <span className="font-display text-2xl text-muted-foreground italic">{String(item.order_index).padStart(2, "0")}</span>
                  <span className="flex-1">{item.title}</span>
                  <Lock className="size-4 text-muted-foreground" aria-label="Materi khusus peserta" />
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-xl border border-dashed bg-card p-6 text-sm text-muted-foreground">Materi sedang disiapkan oleh instruktur.</p>
          )}
          <p className="text-sm text-muted-foreground">Isi materi hanya dapat diakses oleh Student yang mengikuti course ini.</p>
        </section>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="space-y-4 rounded-xl border bg-card p-6 shadow-xs">
            <p className="eyebrow text-muted-foreground">Ikuti kelas</p>
            <CourseActions course={course} viewer={viewer} enrollment={enrollments.get(course.id)} layout="detail" />
          </div>
          {teacher && <TeacherCard teacher={teacher} />}
        </aside>
      </div>
    </>
  );
}
