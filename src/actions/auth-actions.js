"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth/auth";
import { getDashboardPath, getSafeRedirectPath } from "@/lib/auth/roles";
import { query, queryOne } from "@/lib/db";
import {
  forgotPasswordSchema,
  loginSchema,
  registerStudentSchema,
  registerTeacherSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import {
  actionError,
  actionSuccess,
  formDataToObject,
  validationError,
} from "@/lib/utils/action-result";

/**
 * Server Actions autentikasi.
 * Semua proses (register, login, logout, reset password) dijalankan
 * oleh Better Auth lewat auth.api. Tidak ada sistem login kedua.
 * Plugin nextCookies() otomatis menyimpan cookie session.
 */

// ---------------------------------------------------------------
// LOGIN
// ---------------------------------------------------------------
export async function loginAction(_prevState, formData) {
  const input = formDataToObject(formData);
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error, input);

  const { identifier, password, rememberMe, callbackUrl } = parsed.data;
  const invalid = actionError("Email/username atau password salah.", {}, input);

  // Jika yang diisi username, cari email-nya dulu. Better Auth tetap
  // yang memverifikasi password (bcrypt.compare) dan membuat session.
  let email = identifier;
  if (!identifier.includes("@")) {
    const row = await queryOne(`SELECT email FROM users WHERE username = $1`, [identifier]);
    if (!row) return invalid;
    email = row.email;
  }

  let user;
  try {
    const result = await auth.api.signInEmail({
      body: { email, password, rememberMe },
      headers: await headers(),
    });
    user = result.user;
  } catch (error) {
    if (error instanceof APIError && error.body?.code === "INVALID_EMAIL_OR_PASSWORD") return invalid;
    return actionError(getAuthErrorMessage(error, "Login gagal. Silakan coba lagi."), {}, input);
  }

  // redirect() harus dipanggil di luar try/catch.
  redirect(getSafeRedirectPath(callbackUrl, getDashboardPath(user.role)));
}

// ---------------------------------------------------------------
// REGISTER AS STUDENT
// ---------------------------------------------------------------
export async function registerStudentAction(_prevState, formData) {
  const input = formDataToObject(formData);
  const parsed = registerStudentSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error, input);

  const duplicate = await findDuplicateAccount(parsed.data, input);
  if (duplicate) return duplicate;

  try {
    await signUp(parsed.data);
  } catch (error) {
    return actionError(getAuthErrorMessage(error, "Registrasi gagal. Silakan coba lagi."), {}, input);
  }

  redirect("/student?welcome=1");
}

// ---------------------------------------------------------------
// REGISTER AS TEACHER
// Akun dibuat dengan role STUDENT, lalu pengajuan Teacher disimpan
// dengan status 'pending' sampai Admin menyetujui.
// ---------------------------------------------------------------
export async function registerTeacherAction(_prevState, formData) {
  const input = formDataToObject(formData);
  const parsed = registerTeacherSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error, input);

  const duplicate = await findDuplicateAccount(parsed.data, input);
  if (duplicate) return duplicate;

  const { expertise, experience, motivation } = parsed.data;
  let user;

  try {
    user = (await signUp(parsed.data)).user;
  } catch (error) {
    return actionError(getAuthErrorMessage(error, "Registrasi gagal. Silakan coba lagi."), {}, input);
  }

  try {
    await query(
      `INSERT INTO teacher_applications (user_id, expertise, experience, motivation, status)
       VALUES ($1, $2, $3, $4, 'pending')`,
      [user.id, expertise, experience, motivation],
    );

    // Beri tahu semua Admin bahwa ada pengajuan baru.
    await query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       SELECT id, 'system', 'Pengajuan Teacher baru',
              $1 || ' mengajukan diri sebagai Teacher (' || $2 || ').',
              '/admin/teacher-applications'
         FROM users WHERE role = 'admin'`,
      [user.name, expertise],
    );
  } catch (error) {
    // Akun sudah terbuat dan sudah login. Pengajuan bisa diulang
    // dari halaman profil, jadi cukup dicatat di log server.
    console.error("[auth] Gagal menyimpan pengajuan Teacher:", error);
  }

  redirect("/profile?applied=1");
}

// ---------------------------------------------------------------
// LOGOUT
// ---------------------------------------------------------------
export async function logoutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login?logout=1");
}

// ---------------------------------------------------------------
// FORGOT PASSWORD & RESET PASSWORD
// ---------------------------------------------------------------
export async function forgotPasswordAction(_prevState, formData) {
  const input = formDataToObject(formData);
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error, input);

  try {
    await auth.api.requestPasswordReset({
      body: { email: parsed.data.email, redirectTo: "/reset-password" },
      headers: await headers(),
    });
  } catch (error) {
    console.error("[auth] Gagal membuat tautan reset password:", error);
  }

  // Pesan sengaja sama untuk email terdaftar maupun tidak, agar
  // orang lain tidak bisa mengecek email siapa saja yang terdaftar.
  return actionSuccess(
    "Jika email terdaftar, tautan reset password telah dibuat. Tautan berlaku 1 jam.",
  );
}

export async function resetPasswordAction(_prevState, formData) {
  const input = formDataToObject(formData);
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error, input);

  try {
    await auth.api.resetPassword({
      body: { newPassword: parsed.data.password, token: parsed.data.token },
      headers: await headers(),
    });
  } catch (error) {
    return actionError(getAuthErrorMessage(error, "Gagal mengganti password."));
  }

  redirect("/login?reset=1");
}

// ---------------------------------------------------------------
// Helper
// ---------------------------------------------------------------
async function signUp({ name, username, email, password }) {
  return auth.api.signUpEmail({
    body: { name, username, email, password },
    headers: await headers(),
  });
}

async function findDuplicateAccount({ email, username }, input) {
  const existing = await queryOne(
    `SELECT
        EXISTS (SELECT 1 FROM users WHERE email = $1)    AS email_taken,
        EXISTS (SELECT 1 FROM users WHERE username = $2) AS username_taken`,
    [email, username],
  );

  const fieldErrors = {};
  if (existing.email_taken) fieldErrors.email = ["Email sudah terdaftar."];
  if (existing.username_taken) fieldErrors.username = ["Username sudah dipakai."];

  return Object.keys(fieldErrors).length > 0
    ? actionError("Periksa kembali data yang Anda isi.", fieldErrors, input)
    : null;
}

function getAuthErrorMessage(error, fallback) {
  if (error instanceof APIError) {
    switch (error.body?.code) {
      case "INVALID_EMAIL_OR_PASSWORD":
        return "Email atau password salah.";
      case "USER_ALREADY_EXISTS":
      case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
        return "Email sudah terdaftar.";
      case "INVALID_TOKEN":
        return "Tautan reset password tidak valid atau sudah kedaluwarsa.";
      default:
        return error.body?.message || fallback;
    }
  }
  console.error("[auth]", error);
  return fallback;
}
