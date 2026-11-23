import Link from "next/link";
import { BookOpen, ListOrdered, Plus } from "lucide-react";
import { CourseTable } from "@/components/dashboard/course-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FlashToast } from "@/components/shared/flash-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { listManagedCourses } from "@/lib/db/queries/manage-courses";

export const metadata = { title: "Course Saya | Teacher KARÉLLE" };

const FLASH = { created: "Course baru berhasil dibuat. Tambahkan materinya sekarang.", updated: "Perubahan course disimpan." };

export default async function TeacherCoursesPage({ searchParams }) {
  const user = await requireRole(ROLES.TEACHER);
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  // Teacher hanya melihat course miliknya (filter teacher_id di query SQL).
  const courses = await listManagedCourses({ teacherId: user.role === ROLES.ADMIN ? null : user.id, search });

  return (
    <>
      <FlashToast message={FLASH[params.success]} />
      <PageHeader eyebrow="Course Management" title="Course saya" description="Buat course baru, ubah informasinya, dan kelola materi di dalamnya.">
        <Button asChild><Link href="/teacher/courses/new"><Plus /> Buat course</Link></Button>
      </PageHeader>
      <form method="get" role="search" className="flex max-w-xl gap-2">
        <Input name="search" type="search" defaultValue={search} placeholder="Cari judul course" aria-label="Cari course" />
        <Button type="submit" className="h-11">Cari</Button>
      </form>
      {courses.length > 0 ? (
        <CourseTable
          courses={courses}
          basePath="/teacher"
          showTeacher={user.role === ROLES.ADMIN}
          extraActions={(course) => (
            <Button asChild variant="outline" size="sm">
              <Link href={`/teacher/courses/${course.id}/contents`}><ListOrdered /> Materi</Link>
            </Button>
          )}
        />
      ) : (
        <EmptyState icon={BookOpen} title={search ? "Course tidak ditemukan" : "Belum ada course"} description={search ? "Ubah kata kunci pencarian." : "Buat course pertama Anda untuk mulai mengajar."}>
          {!search && <Button asChild><Link href="/teacher/courses/new"><Plus /> Buat course</Link></Button>}
        </EmptyState>
      )}
    </>
  );
}
