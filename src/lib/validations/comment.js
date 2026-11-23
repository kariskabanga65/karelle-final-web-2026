import { z } from "zod";

export const commentSchema = z.object({
  body: z
    .string({ error: "Komentar wajib diisi." })
    .trim()
    .min(2, { error: "Komentar minimal 2 karakter." })
    .max(2000, { error: "Komentar maksimal 2000 karakter." }),
});
