import { z } from "zod";

export const courseListQuerySchema = z.object({
  search: z.string().trim().max(100, { error: "search maksimal 100 karakter." }).optional().default(""),
  category: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]*$/, { error: "category harus berupa slug (huruf kecil, angka, tanda -)." })
    .max(60)
    .optional()
    .default(""),
  page: z.coerce.number({ error: "page harus berupa angka." }).int().min(1).max(1000).optional().default(1),
  limit: z.coerce.number({ error: "limit harus berupa angka." }).int().min(1).max(50).optional().default(12),
});
