import { z } from "zod";

export const lessonSchema = z.object({
  title: z
    .string({ error: "Judul materi wajib diisi." })
    .trim()
    .min(3, { error: "Judul materi minimal 3 karakter." })
    .max(150, { error: "Judul materi maksimal 150 karakter." }),
  content: z
    .string({ error: "Isi materi wajib diisi." })
    .max(100_000, { error: "Isi materi terlalu panjang (maksimal 100.000 karakter)." }),
});

export const LESSON_MIN_TEXT = 20;
