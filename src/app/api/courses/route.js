import { NextResponse } from "next/server";
import { z } from "zod";
import { searchCourses } from "@/lib/db/queries/courses";
import { courseListQuerySchema } from "@/lib/validations/api";

/**
 * GET /api/courses
 * Katalog course publik dalam format JSON (pencarian, filter kategori, paginasi).
 *
 * Contoh: /api/courses?search=runway&category=runway-catwalk&page=1&limit=12
 */
export async function GET(request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = courseListQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Parameter tidak valid.", fieldErrors: z.flattenError(parsed.error).fieldErrors },
      { status: 400 },
    );
  }

  const { search, category, page, limit } = parsed.data;
  try {
    const all = await searchCourses({ search, categorySlug: category });
    const start = (page - 1) * limit;
    const data = all.slice(start, start + limit).map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      category: { name: course.category_name, slug: course.category_slug },
      teacher: { name: course.teacher_name, username: course.teacher_username },
      lessons: Number(course.content_count),
      students: Number(course.student_count),
      startDate: course.start_date,
      endDate: course.end_date,
      thumbnailUrl: course.thumbnail_url,
      url: `/courses/${course.slug}`,
    }));

    return NextResponse.json(
      { success: true, data, pagination: { page, limit, total: all.length, totalPages: Math.max(1, Math.ceil(all.length / limit)) } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[GET /api/courses]", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
