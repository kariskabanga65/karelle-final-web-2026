import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/course/category-card";
import { TeacherCard } from "@/components/course/teacher-card";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { BenefitStrip } from "@/components/home/benefit-strip";
import { PopularCourseList } from "@/components/home/popular-course-list";
import { CourseFilters } from "@/components/shared/course-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { getCurrentUser } from "@/lib/auth/session";
import { getCategoriesWithCourseCount, getPlatformStats, getPopularCourses, getProgramCourses } from "@/lib/db/queries/courses";
import { getEnrollmentMap } from "@/lib/db/queries/enrollments";
import { getTeachers } from "@/lib/db/queries/teachers";

export const metadata = {
  title: "KARÉLLE — Modeling Course",
};

const GALLERY = [
  { src: "/images/gallery/runway-rehearsal.jpg", alt: "Para model berlatih catwalk berbaris di studio", position: "object-center" },
  { src: "/images/gallery/on-set-clapper.jpg", alt: "Model di depan kamera dengan clapperboard saat syuting", position: "object-[center_35%]" },
  { src: "/images/gallery/studio-photoshoot.jpg", alt: "Fotografer memotret model di studio dengan softbox", position: "object-[center_60%]" },
  { src: "/images/gallery/beauty-lighting.jpg", alt: "Model duduk di bawah lampu lantern saat sesi beauty shot", position: "object-[center_62%]" },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  const [programs, categories, popularCourses, teachers, stats, enrollments] = await Promise.all([
    getProgramCourses(4),
    getCategoriesWithCourseCount(),
    getPopularCourses(5),
    getTeachers({ limit: 3 }),
    getPlatformStats(),
    getEnrollmentMap(user && user.role !== "admin" ? user.id : null),
  ]);

  return (
    <>
      <HeroCarousel />
      <BenefitStrip />

      {/* OUR COURSES — Modeling Programs (4 kelas dari database) */}
      <section aria-labelledby="programs-title" className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,22rem)_1fr] lg:py-24">
        <div className="flex flex-col justify-center gap-6">
          <p className="eyebrow">Our Courses</p>
          <h2 id="programs-title" className="display-title text-6xl">
            Modeling <em className="italic">Programs</em>
          </h2>
          <p className="text-muted-foreground">
            Program lengkap untuk mengembangkan kemampuan modeling Anda, dari dasar hingga level profesional.
          </p>
          <Button asChild size="lg" className="w-fit rounded-sm">
            <Link href="/courses">View All Courses <ArrowRight /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {programs.map((course) => (
            <CategoryCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* COURSE TERPOPULER (maksimal 5) + search & filter kategori */}
      <section aria-labelledby="popular-title" className="border-t bg-card">
        <div className="mx-auto max-w-7xl space-y-10 px-5 py-20 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
            <div className="space-y-5">
              <p className="eyebrow">Most Popular</p>
              <h2 id="popular-title" className="display-title text-5xl sm:text-6xl">
                Popular <em className="italic">Classes</em>
              </h2>
            </div>
            <CourseFilters categories={categories} />
          </div>
          {popularCourses.length > 0 ? (
            <PopularCourseList courses={popularCourses} enrollments={enrollments} />
          ) : (
            <EmptyState title="Belum ada course" description="Course yang dibuat Teacher akan tampil di sini." />
          )}
        </div>
      </section>

      {/* WHY CHOOSE KARÉLLE — About */}
      <section id="about" aria-labelledby="about-title" className="relative scroll-mt-20 overflow-hidden bg-ink text-white">
        <div className="absolute inset-y-0 left-0 w-full lg:w-3/5 lg:[mask-image:linear-gradient(to_right,black_45%,transparent)]">
          <Image src="/images/editorial-face.jpg" alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover object-[72%_40%] opacity-30 lg:opacity-100" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
          <div className="hidden lg:block" />
          <div className="space-y-7">
            <p className="eyebrow text-white/80">Why Choose KARÉLLE?</p>
            <h2 id="about-title" className="font-display text-4xl leading-tight italic sm:text-5xl">
              More Than a Course, It&apos;s Your Modeling Foundation.
            </h2>
            <p className="leading-relaxed text-white/70">
              KARÉLLE adalah platform kursus modeling berbasis kelas. Setiap kelas dipandu instruktur berpengalaman,
              tersusun dari materi berurutan, dan dilengkapi forum diskusi serta pelacakan progress belajar.
            </p>
            <dl className="grid grid-cols-3 gap-6 border-y border-ink-border py-6">
              <Stat label="Course" value={stats.course_count} />
              <Stat label="Instruktur" value={stats.teacher_count} />
              <Stat label="Student" value={stats.student_count} />
            </dl>
            <Button asChild variant="outline-light" size="lg" className="rounded-sm">
              <Link href="/teachers">Kenali instruktur kami <ArrowRight /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FEATURED TEACHERS */}
      <section aria-labelledby="teachers-title" className="mx-auto max-w-7xl space-y-12 px-5 py-20 sm:px-8 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-5">
            <p className="eyebrow">Featured Instructors</p>
            <h2 id="teachers-title" className="display-title text-5xl sm:text-6xl">
              Learn from the <em className="italic">best</em>
            </h2>
          </div>
          <Button asChild variant="outline" className="rounded-sm">
            <Link href="/teachers">Semua instruktur <ArrowRight /></Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {teachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" aria-labelledby="gallery-title" className="scroll-mt-20 bg-card">
        <div className="mx-auto max-w-7xl space-y-10 px-5 py-20 sm:px-8">
          <div className="space-y-5">
            <p className="eyebrow">Gallery</p>
            <h2 id="gallery-title" className="display-title text-5xl sm:text-6xl">
              Behind the <em className="italic">lens</em>
            </h2>
          </div>
          {/* 4 foto portrait; kolom ke-2 & ke-4 diturunkan sedikit agar terasa editorial */}
          <div className="grid grid-cols-2 items-start gap-3 sm:gap-4 md:grid-cols-4 md:pb-12">
            {GALLERY.map((photo) => (
              <figure key={photo.src} className="relative aspect-[3/4] overflow-hidden rounded-xl bg-ink md:even:mt-12">
                <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 768px) 25vw, 50vw" className={`object-cover grayscale transition-transform duration-700 hover:scale-105 ${photo.position}`} />
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section aria-labelledby="cta-title" className="relative overflow-hidden bg-ink text-white">
        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-7 px-5 py-24 text-center sm:px-8">
          <p className="eyebrow text-white/80">Start Today</p>
          <h2 id="cta-title" className="display-title text-5xl sm:text-6xl">
            Ready for your <em className="italic">first walk?</em>
          </h2>
          <p className="max-w-xl text-white/70">
            Daftar gratis sebagai Student untuk mulai belajar, atau ajukan diri sebagai Teacher untuk berbagi keahlian Anda.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="light" size="lg" className="rounded-sm">
              <Link href="/register/student">Daftar sebagai Student</Link>
            </Button>
            <Button asChild variant="outline-light" size="lg" className="rounded-sm">
              <Link href="/register/teacher">Daftar sebagai Teacher</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="mt-1 text-xs tracking-[0.2em] text-white/55 uppercase">{label}</dt>
      <dd className="font-display text-4xl">{value}</dd>
    </div>
  );
}
