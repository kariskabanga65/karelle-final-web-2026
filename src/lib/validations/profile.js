import { z } from "zod";
import { passwordField } from "./auth";

const optionalText = (max, label) =>
  z
    .string()
    .trim()
    .max(max, { error: `${label} maksimal ${max} karakter.` })
    .optional()
    .transform((value) => (value ? value : null));

export const profileSchema = z.object({
  name: z
    .string({ error: "Nama wajib diisi." })
    .trim()
    .min(3, { error: "Nama minimal 3 karakter." })
    .max(100, { error: "Nama maksimal 100 karakter." }),
  headline: optionalText(120, "Headline"),
  bio: optionalText(500, "Bio"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: "Password saat ini wajib diisi." }),
    newPassword: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Konfirmasi password tidak sama.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    error: "Password baru harus berbeda dari password saat ini.",
    path: ["newPassword"],
  });
