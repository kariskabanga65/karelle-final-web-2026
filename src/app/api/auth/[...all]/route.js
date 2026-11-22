import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth/auth";

// Semua endpoint Better Auth: /api/auth/sign-in/email, /api/auth/sign-out,
// /api/auth/get-session, /api/auth/request-password-reset, dan lainnya.
export const { GET, POST } = toNextJsHandler(auth);
