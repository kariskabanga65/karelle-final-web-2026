import { z } from "zod";

/**
 * Skema validasi form autentikasi.
 * Dipakai di SERVER (Server Action), sehingga data tetap divalidasi
 * walaupun validasi di browser dilewati.
 */

const emailField = z
  .string({ error: "Email wajib diisi." })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Format email tidak valid." }));

export const passwordField = z
  .string({ error: "Password wajib diisi." })
  .min(8, { error: "Password minimal 8 karakter." })
  .max(72, { error: "Password maksimal 72 karakter." })
  .regex(/[A-Za-z]/, { error: "Password harus mengandung huruf." })
  .regex(/[0-9]/, { error: "Password harus mengandung angka." });

const nameField = z
  .string({ error: "Nama wajib diisi." })
  .trim()
  .min(3, { error: "Nama minimal 3 karakter." })
  .max(80, { error: "Nama maksimal 80 karakter." });

const usernameField = z
  .string({ error: "Username wajib diisi." })
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_.]{3,30}$/, {
    error: "Username 3-30 karakter: huruf kecil, angka, titik, atau underscore.",
  });

/**
 * Login memakai email ATAU username.
 * rememberMe: dicentang -> session bertahan 7 hari,
 * tidak dicentang -> session berakhir saat browser ditutup.
 */
export const loginSchema = z.object({
  identifier: z
    .string({ error: "Email atau username wajib diisi." })
    .trim()
    .toLowerCase()
    .min(3, { error: "Email atau username wajib diisi." })
    .max(254),
  password: z.string().min(1, { error: "Password wajib diisi." }),
  rememberMe: z.string().optional().transform((value) => value === "on"),
  callbackUrl: z.string().optional(),
});

const registerBase = z.object({
  name: nameField,
  username: usernameField,
  email: emailField,
  password: passwordField,
  confirmPassword: z.string(),
});

const passwordsMatch = (data) => data.password === data.confirmPassword;
const passwordsMatchError = {
  error: "Konfirmasi password tidak sama.",
  path: ["confirmPassword"],
};

export const registerStudentSchema = registerBase.refine(passwordsMatch, passwordsMatchError);

/** Field pengajuan Teacher. Dipakai form register Teacher dan form Tambah User (Admin). */
export const teacherApplicationFields = {
  expertise: z
    .string({ error: "Bidang keahlian wajib dipilih." })
    .trim()
    .min(3, { error: "Bidang keahlian wajib dipilih." })
    .max(80),
  experience: z
    .string()
    .trim()
    .min(20, { error: "Ceritakan pengalaman Anda minimal 20 karakter." })
    .max(1000, { error: "Pengalaman maksimal 1000 karakter." }),
  motivation: z
    .string()
    .trim()
    .min(20, { error: "Motivasi minimal 20 karakter." })
    .max(1000, { error: "Motivasi maksimal 1000 karakter." }),
};

export const registerTeacherSchema = registerBase
  .extend(teacherApplicationFields)
  .refine(passwordsMatch, passwordsMatchError);

export const forgotPasswordSchema = z.object({ email: emailField });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { error: "Token reset tidak valid." }),
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine(passwordsMatch, passwordsMatchError);
