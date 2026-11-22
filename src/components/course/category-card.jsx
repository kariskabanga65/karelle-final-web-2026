import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Images, Triangle, UsersRound } from "lucide-react";
import { getCategoryImage } from "@/lib/utils/format";

const ICONS = {
  "runway-catwalk": Triangle,
  "photoshoot-posing": Camera,
  "model-portfolio": Images,
  "casting-preparation": UsersRound,
};

/**
 * Kartu bergaya editorial gelap (section "Modeling Programs").
 * Menerima kategori, atau kelas (course) dengan category_slug.
 */
export function CategoryCard({ category, course }) {
  const slug = course ? course.category_slug : category.slug;
  const Icon = ICONS[slug] ?? Triangle;
  const title = course ? course.title : category.name;
  const subtitle = course ? `${course.content_count} materi · ${course.teacher_name}` : `${category.course_count} course`;
  const href = course ? `/courses/${course.slug}` : `/courses?category=${category.slug}`;
  return (
    <Link
      href={href}
      className="group relative flex aspect-[11/16] flex-col justify-end overflow-hidden rounded-xl bg-ink p-5 text-white"
    >
      <Image
        src={course?.thumbnail_url || getCategoryImage(slug)}
        alt=""
        fill
        sizes="(min-width: 1024px) 18vw, (min-width: 640px) 45vw, 90vw"
        className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 via-45% to-transparent" />
      <div className="relative space-y-4">
        <Icon className="size-8 stroke-[1.2]" aria-hidden />
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="text-lg leading-snug">{title}</h3>
            <p className="mt-1 text-xs text-white/60">{subtitle}</p>
          </div>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/70 transition-colors group-hover:bg-white group-hover:text-ink">
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
