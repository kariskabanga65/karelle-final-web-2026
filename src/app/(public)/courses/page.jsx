import { CourseCard } from "@/components/course/course-card";
import { CourseFilters } from "@/components/shared/course-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getCategoriesWithCourseCount, searchCourses } from "@/lib/db/queries/courses";
import { getEnrollmentMap } from "@/lib/db/queries/enrollments";

export const metadata = { title: "Katalog Course | KARÉLLE" };

export default async function CourseCatalogPage({ searchParams }) {
  const params = await searchParams;
  const search = typeof params?.search === "string" ? params.search : "";
  const categorySlug = typeof params?.category === "string" ? params.category : "";

  const user = await getCurrentUser();
  const [categories, courses, enrollments] = await Promise.all([
    getCategoriesWithCourseCount(),
    searchCourses({ search, categorySlug }),
    getEnrollmentMap(user?.role === "student" ? user.id : null),
  ]);
  const activeCategory = categories.find((category) => category.slug === categorySlug);
  const viewer = user ? { id: user.id, role: user.role } : null;

  return (
    <>
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-7xl space-y-5 px-5 py-16 sm:px-8 lg:py-20">
          <p className="eyebrow text-white/80">Course Catalog</p>
          <h1 className="display-title text-5xl sm:text-7xl">
            {activeCategory ? activeCategory.name : <>All <em className="italic">Courses</em></>}
          </h1>
          <p className="max-w-xl text-white/65">
            {activeCategory?.description ?? "Temukan kelas modeling yang sesuai dengan tujuan karier Anda."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-10 px-5 py-12 sm:px-8">
        <CourseFilters categories={categories} search={search} activeCategory={categorySlug} />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {courses.length} course ditemukan{search && <> untuk &ldquo;{search}&rdquo;</>}
        </p>

        {courses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} viewer={viewer} enrollment={enrollments.get(course.id)} />
            ))}
          </div>
        ) : (
          <EmptyState title="Course tidak ditemukan" description="Coba kata kunci lain atau pilih kategori berbeda.">
            <Button asChild variant="outline"><Link href="/courses">Tampilkan semua course</Link></Button>
          </EmptyState>
        )}
      </section>
    </>
  );
}
