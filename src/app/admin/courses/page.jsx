import { BookOpen, ListOrdered, Plus } from "lucide-react";
import Link from "next/link";
import { CourseTable } from "@/components/dashboard/course-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FlashToast } from "@/components/shared/flash-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { listManagedCourses } from "@/lib/db/queries/manage-courses";

export const metadata = { title: "Courses | Admin KARÉLLE" };

const FLASH = { created: "Course baru berhasil dibuat.", updated: "Perubahan course disimpan." };

export default async function AdminCoursesPage({ searchParams }) {
  await requireRole(ROLES.ADMIN);
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const courses = await listManagedCourses({ search });

  return (
    <>
      <FlashToast message={FLASH[params.success]} />
      <PageHeader eyebrow="Course Management" title="Courses" description="Admin dapat mengelola semua course dan menentukan Teacher-nya.">
        <Button asChild><Link href="/admin/courses/new"><Plus /> Buat course</Link></Button>
      </PageHeader>
      <form method="get" role="search" className="flex max-w-xl gap-2">
        <Input name="search" type="search" defaultValue={search} placeholder="Cari judul atau nama teacher" aria-label="Cari course" />
        <Button type="submit" className="h-11">Cari</Button>
      </form>
      {courses.length > 0 ? (
        <CourseTable
          courses={courses}
          basePath="/admin"
          showTeacher
          extraActions={(course) => (
            <Button asChild variant="outline" size="sm">
              <Link href={`/teacher/courses/${course.id}/contents`}><ListOrdered /> Materi</Link>
            </Button>
          )}
        />
      ) : (
        <EmptyState icon={BookOpen} title="Course tidak ditemukan" description="Buat course baru atau ubah kata kunci pencarian." />
      )}
    </>
  );
}
