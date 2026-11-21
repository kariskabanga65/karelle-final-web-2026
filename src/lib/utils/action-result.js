import { z } from "zod";

/**
 * Format hasil Server Action yang seragam, supaya setiap form bisa
 * menampilkan pesan sukses, pesan error umum, dan error per field.
 *
 *   { success: true,  message: "..." }
 *   { success: false, error: "...", fieldErrors: { email: ["..."] }, values: {...} }
 *
 * `values` berisi isian form sebelumnya. React 19 mengosongkan form
 * setelah action selesai, jadi nilai ini dipakai sebagai defaultValue
 * agar pengguna tidak perlu mengetik ulang saat ada error.
 * Field password dan token TIDAK pernah dikembalikan.
 */

const SENSITIVE_FIELD = /password|token/i;

export function actionSuccess(message, data = {}) {
  return { success: true, message, ...data };
}

export function actionError(error, fieldErrors = {}, values = {}) {
  return { success: false, error, fieldErrors, values: removeSensitiveFields(values) };
}

/** Mengubah hasil validasi Zod yang gagal menjadi actionError. */
export function validationError(zodError, values = {}, message = "Periksa kembali data yang Anda isi.") {
  return actionError(message, z.flattenError(zodError).fieldErrors, values);
}

/** Mengambil semua nilai string dari FormData menjadi object biasa. */
export function formDataToObject(formData) {
  const result = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$ACTION")) result[key] = value;
  }
  return result;
}

function removeSensitiveFields(values) {
  return Object.fromEntries(
    Object.entries(values ?? {}).filter(([key]) => !SENSITIVE_FIELD.test(key)),
  );
}
