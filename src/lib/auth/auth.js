import "server-only";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { pool } from "@/lib/db";
import { hashPassword, verifyPassword } from "./password";
import { ROLES } from "./roles";

const USERNAME_PATTERN = /^[a-z0-9_.]{3,30}$/;

export const auth = betterAuth({
  appName: "KARÉLLE — Modeling Course",
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: pool,

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 72, 
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
    resetPasswordTokenExpiresIn: 60 * 60, 
    revokeSessionsOnPasswordReset: true,
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
        input: false, 
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
    expiresIn: 60 * 60 * 24 * 7, 
    updateAge: 60 * 60 * 24, 
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

  plugins: [nextCookies()],
});
