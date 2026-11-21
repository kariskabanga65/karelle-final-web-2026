import "server-only";
import { NextResponse } from "next/server";
import { auth } from "./auth";
import { hasRole } from "./session";

/**
 * Pengecekan hak akses untuk Route Handler (/api/...).
 * Berbeda dengan halaman, API tidak melakukan redirect tetapi
 * mengembalikan status HTTP 401/403 dalam format JSON.
 *
 *   export async function GET(request) {
 *     const { user, errorResponse } = await authorizeRequest(request, ["teacher"]);
 *     if (errorResponse) return errorResponse;
 *     ...
 *   }
 *
 * @param {Request} request
 * @param {string[]} [allowedRoles]  kosong = cukup login
 */
export async function authorizeRequest(request, allowedRoles = []) {
  const session = await auth.api.getSession({ headers: request.headers });
  const user = session?.user ?? null;

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: "Silakan login terlebih dahulu." },
        { status: 401 },
      ),
    };
  }

  if (allowedRoles.length > 0 && !hasRole(user, allowedRoles)) {
    return {
      user,
      errorResponse: NextResponse.json(
        { success: false, error: "Anda tidak memiliki akses ke resource ini." },
        { status: 403 },
      ),
    };
  }

  return { user, errorResponse: null };
}
