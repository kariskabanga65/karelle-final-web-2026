import { z } from "zod";

const optionalDate = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), { error: "Format tanggal tidak valid." })
  .transform((value) => value || null);

/**
 * Form course. start_date & end_date opsional (kosong = lifetime access).
 * teacherId hanya dipakai jika yang mengisi adalah Admin.
 */
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
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    error: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
    path: ["endDate"],
  });
