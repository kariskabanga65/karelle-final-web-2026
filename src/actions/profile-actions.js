"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { authorizeAction } from "@/lib/auth/action-guard";
import { auth } from "@/lib/auth/auth";
import { queryOne } from "@/lib/db";
import { getDbErrorMessage } from "@/lib/db/errors";
import { actionError, actionSuccess, formDataToObject, validationError } from "@/lib/utils/action-result";
import { changePasswordSchema, profileSchema } from "@/lib/validations/profile";

/**
 * Mengubah profil sendiri. ID diambil dari session, bukan dari form,
 * sehingga user tidak bisa mengubah profil orang lain.
 * Email, username, dan role tidak dapat diubah dari sini.
 */
export async function updateProfileAction(_prevState, formData) {
  const { user, error } = await authorizeAction();
  if (error) return error;

  const input = formDataToObject(formData);
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error, input);

  try {
    await queryOne(
      `UPDATE users SET name = $1, headline = $2, bio = $3 WHERE id = $4 RETURNING id`,
      [parsed.data.name, parsed.data.headline, parsed.data.bio, user.id],
    );
  } catch (err) {
    return actionError(getDbErrorMessage(err, "Gagal menyimpan profil."), {}, input);
  }

  revalidatePath("/", "layout");
  return actionSuccess("Profil berhasil diperbarui.", { values: parsed.data });
}

/**
 * Ganti password lewat Better Auth (password lama diverifikasi dengan bcrypt).
 * Session lain di perangkat berbeda ikut dicabut.
 */
export async function changePasswordAction(_prevState, formData) {
  const { error } = await authorizeAction();
  if (error) return error;

  const input = formDataToObject(formData);
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error, input);

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });
  } catch (err) {
    if (err instanceof APIError && err.body?.code === "INVALID_PASSWORD") {
      return actionError("Periksa kembali data yang Anda isi.", { currentPassword: ["Password saat ini salah."] });
    }
    console.error("[change-password]", err);
    return actionError("Gagal mengganti password. Coba lagi.");
  }

  return actionSuccess("Password berhasil diganti. Perangkat lain telah dikeluarkan.");
}
