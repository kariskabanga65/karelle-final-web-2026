import { TeacherCard } from "@/components/course/teacher-card";
import { EmptyState } from "@/components/shared/empty-state";
import { getTeachers } from "@/lib/db/queries/teachers";

export const metadata = { title: "Instruktur | KARÉLLE" };

export default async function TeachersPage() {
  const teachers = await getTeachers();

  return (
    <>
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-7xl space-y-5 px-5 py-16 sm:px-8 lg:py-20">
          <p className="eyebrow text-white/80">Our Instructors</p>
          <h1 className="display-title text-5xl sm:text-7xl">Meet the <em className="italic">experts</em></h1>
          <p className="max-w-xl text-white/65">Runway coach, fotografer fashion, dan casting director yang siap membimbing Anda.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        {teachers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => <TeacherCard key={teacher.id} teacher={teacher} showCourses />)}
          </div>
        ) : (
          <EmptyState title="Belum ada instruktur" description="Instruktur yang disetujui Admin akan tampil di sini." />
        )}
      </section>
    </>
  );
}
