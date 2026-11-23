import { z } from "zod";

const THUMBNAIL_URL = /^\/api\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

const optionalDate = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), { error: "Format tanggal tidak valid." })
  .transform((value) => value || null);

export const courseSchema = z
  .object({
    title: z.string().trim().min(5, { error: "Judul minimal 5 karakter." }).max(120, { error: "Judul maksimal 120 karakter." }),
    description: z
      .string()
      .trim()
      .min(20, { error: "Deskripsi minimal 20 karakter." })
      .max(2000, { error: "Deskripsi maksimal 2000 karakter." }),
    categoryId: z.guid({ error: "Pilih kategori." }),
    teacherId: z.string().trim().optional(),
    startDate: optionalDate,
    endDate: optionalDate,
    thumbnailUrl: z
      .string()
      .trim()
      .optional()
      .default("")
      .refine((value) => value === "" || THUMBNAIL_URL.test(value), { error: "Thumbnail tidak valid. Unggah ulang gambarnya." })
      .transform((value) => value || null),
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    error: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
    path: ["endDate"],
  });
