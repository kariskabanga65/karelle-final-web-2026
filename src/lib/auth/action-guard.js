import "server-only";
import { actionError } from "@/lib/utils/action-result";
import { getCurrentUser, hasRole } from "./session";

/**
 * Pengecekan hak akses di awal setiap Server Action.
 * Server Action bisa dipanggil langsung tanpa membuka halamannya,
 * jadi pengecekan di sini wajib walaupun halaman sudah dilindungi.
 *
 *   const { user, error } = await authorizeAction([ROLES.ADMIN]);
 *   if (error) return error;
 */
export async function authorizeAction(allowedRoles = []) {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, error: actionError("Sesi Anda sudah berakhir. Silakan login kembali.") };
  }
  if (allowedRoles.length > 0 && !hasRole(user, allowedRoles)) {
    return { user, error: actionError("Anda tidak memiliki akses untuk melakukan aksi ini.") };
  }
  return { user, error: null };
}
