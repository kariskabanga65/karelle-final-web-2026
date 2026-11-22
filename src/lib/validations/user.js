import { z } from "zod";

const ROLE_VALUES = ["admin", "teacher", "student"];

const baseUser = {
  name: z.string().trim().min(3, { error: "Nama minimal 3 karakter." }).max(80, { error: "Nama maksimal 80 karakter." }),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_.]{3,30}$/, { error: "Username 3-30 karakter: huruf kecil, angka, titik, atau underscore." }),
  email: z.string().trim().toLowerCase().pipe(z.email({ error: "Format email tidak valid." })),
  role: z.enum(ROLE_VALUES, { error: "Role tidak valid." }),
};

const strongPassword = z
  .string()
  .min(8, { error: "Password minimal 8 karakter." })
  .max(72, { error: "Password maksimal 72 karakter." })
  .regex(/[A-Za-z]/, { error: "Password harus mengandung huruf." })
  .regex(/[0-9]/, { error: "Password harus mengandung angka." });

/** Create User: password wajib. */
export const createUserSchema = z.object({ ...baseUser, password: strongPassword });

/** Edit User: password boleh dikosongkan (berarti tidak diganti). */
export const updateUserSchema = z.object({
  ...baseUser,
  password: z.union([z.literal(""), strongPassword]).optional(),
});

export const rejectApplicationSchema = z.object({
  reason: z.string().trim().max(500, { error: "Alasan maksimal 500 karakter." }).optional(),
});
