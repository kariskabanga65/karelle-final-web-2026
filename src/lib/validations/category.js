import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { error: "Nama kategori minimal 3 karakter." })
    .max(60, { error: "Nama kategori maksimal 60 karakter." }),
  description: z.string().trim().max(300, { error: "Deskripsi maksimal 300 karakter." }).optional(),
});
