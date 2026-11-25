import { z } from "zod";
import { teacherApplicationFields } from "./auth";

/** Role saat Tambah User: Admin boleh membuat akun Admin baru. */
const CREATE_ROLE_VALUES = ["student", "teacher", "admin"];

/**
 * Role saat Edit User: hanya Student <-> Teacher. User yang sudah ada tidak
 * diubah menjadi Admin, dan role akun Admin tidak diubah lewat form.
 */
const EDIT_ROLE_VALUES = ["student", "teacher"];

const baseUser = {
  name: z.string().trim().min(3, { error: "Nama minimal 3 karakter." }).max(80, { error: "Nama maksimal 80 karakter." }),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_.]{3,30}$/, { error: "Username 3-30 karakter: huruf kecil, angka, titik, atau underscore." }),
  email: z.string().trim().toLowerCase().pipe(z.email({ error: "Format email tidak valid." })),
};

const strongPassword = z
  .string()
  .min(8, { error: "Password minimal 8 karakter." })
  .max(72, { error: "Password maksimal 72 karakter." })
  .regex(/[A-Za-z]/, { error: "Password harus mengandung huruf." })
  .regex(/[0-9]/, { error: "Password harus mengandung angka." });

const teacherFieldsSchema = z.object(teacherApplicationFields);

/**
 * Create User: password wajib dan harus dikonfirmasi.
 * Role Teacher wajib mengisi field yang sama dengan form register Teacher
 * (bidang keahlian, pengalaman, motivasi), agar setiap Teacher punya data pengajuan.
 */
export const createUserSchema = z
  .object({
    ...baseUser,
    role: z.enum(CREATE_ROLE_VALUES, { error: "Role tidak valid." }),
    password: strongPassword,
    confirmPassword: z.string(),
    expertise: z.string().optional(),
    experience: z.string().optional(),
    motivation: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({ code: "custom", message: "Konfirmasi password tidak sama.", path: ["confirmPassword"] });
    }
    if (data.role !== "teacher") return;
    const teacher = teacherFieldsSchema.safeParse(data);
    if (!teacher.success) {
      for (const issue of teacher.error.issues) {
        ctx.addIssue({ code: "custom", message: issue.message, path: issue.path });
      }
    }
  })
  .transform((data) => {
    if (data.role !== "teacher") return { ...data, expertise: null, experience: null, motivation: null };
    return { ...data, ...teacherFieldsSchema.parse(data) };
  });

/**
 * Edit User. Role user non-admin bisa diubah antara Student dan Teacher.
 * Field pengajuan (bidang keahlian, pengalaman, motivasi) baru diwajibkan
 * di server saat Student diubah menjadi Teacher, karena hanya di sana
 * role lama user diketahui. Password boleh dikosongkan (tidak diganti).
 */
export const updateUserSchema = z.object({
  ...baseUser,
  role: z.enum(EDIT_ROLE_VALUES, { error: "Role tidak valid." }).optional(),
  password: z.union([z.literal(""), strongPassword]).optional(),
  expertise: z.string().optional(),
  experience: z.string().optional(),
  motivation: z.string().optional(),
});

/** Validasi field pengajuan Teacher saja (dipakai saat Student diubah menjadi Teacher). */
export const teacherApplicationSchema = teacherFieldsSchema;

export const rejectApplicationSchema = z.object({
  reason: z.string().trim().max(500, { error: "Alasan maksimal 500 karakter." }).optional(),
});
