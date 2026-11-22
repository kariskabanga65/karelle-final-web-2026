import "server-only";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { pool } from "@/lib/db";
import { hashPassword, verifyPassword } from "./password";
import { ROLES } from "./roles";

const USERNAME_PATTERN = /^[a-z0-9_.]{3,30}$/;

/**
 * Konfigurasi Better Auth untuk KARÉLLE.
 *
 * - Database  : PostgreSQL lewat pool `pg` yang sama dengan aplikasi.
 * - Tabel     : users, sessions, accounts, verifications (snake_case),
 *               dipetakan dari nama default Better Auth (camelCase).
 * - Password  : bcryptjs (bukan scrypt bawaan Better Auth).
 * - Role      : kolom users.role, TIDAK bisa diisi dari form register
 *               (input: false), sehingga semua pendaftar menjadi student.
 */
export const auth = betterAuth({
  appName: "KARÉLLE — Modeling Course",
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: pool,

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 72, // batas maksimal bcrypt
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
    resetPasswordTokenExpiresIn: 60 * 60, // 1 jam
    revokeSessionsOnPasswordReset: true,
    /**
     * Proyek ini belum memakai layanan email. Tautan reset password
     * ditampilkan di terminal server (npm run dev) agar fitur tetap
     * bisa diuji. Ganti bagian ini dengan pengirim email sungguhan
     * (misalnya Resend atau Nodemailer) saat aplikasi di-deploy.
     */
    sendResetPassword: async ({ user, url }) => {
      console.info(`\n[auth] Tautan reset password untuk ${user.email}:\n${url}\n`);
    },
  },

  user: {
    modelName: "users",
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    additionalFields: {
      username: { type: "string", required: true, input: true },
      role: {
        type: "string",
        required: false,
        defaultValue: ROLES.STUDENT,
        input: false, // tidak bisa dikirim dari form register
      },
      headline: { type: "string", required: false, input: false },
      bio: { type: "string", required: false, input: false },
    },
  },

  session: {
    modelName: "sessions",
    fields: {
      userId: "user_id",
      expiresAt: "expires_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 hari
    updateAge: 60 * 60 * 24, // perpanjang sesi setiap 1 hari
  },

  account: {
    modelName: "accounts",
    fields: {
      userId: "user_id",
      accountId: "account_id",
      providerId: "provider_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: "id_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },

  verification: {
    modelName: "verifications",
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },

  databaseHooks: {
    user: {
      create: {
        // Lapisan pengaman tambahan untuk request yang langsung ke
        // /api/auth/sign-up/email tanpa melewati form aplikasi.
        before: async (user) => {
          const username = String(user.username ?? "").trim().toLowerCase();
          if (!USERNAME_PATTERN.test(username)) {
            throw new APIError("BAD_REQUEST", {
              message:
                "Username hanya boleh huruf kecil, angka, titik, dan underscore (3-30 karakter).",
            });
          }
          return { data: { ...user, username, role: ROLES.STUDENT } };
        },
      },
    },
  },

  // Wajib diletakkan paling akhir: menyimpan cookie session saat
  // auth.api dipanggil dari Server Action.
  plugins: [nextCookies()],
});
