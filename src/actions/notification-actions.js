"use server";

import { revalidatePath } from "next/cache";
import { authorizeAction } from "@/lib/auth/action-guard";
import { query } from "@/lib/db";
import { actionError, actionSuccess } from "@/lib/utils/action-result";
import { isUuid } from "@/lib/utils/slug";

/** Menandai satu notifikasi milik user sebagai sudah dibaca. */
export async function markNotificationReadAction(notificationId) {
  const { user, error } = await authorizeAction();
  if (error) return error;
  if (!isUuid(notificationId)) return actionError("Notifikasi tidak ditemukan.");

  // WHERE user_id: notifikasi user lain tidak bisa diubah.
  await query(`UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`, [notificationId, user.id]);
  revalidatePath("/", "layout");
  return actionSuccess("Notifikasi ditandai sudah dibaca.");
}

export async function markAllNotificationsReadAction() {
  const { user, error } = await authorizeAction();
  if (error) return error;
  const result = await query(`UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND NOT is_read`, [user.id]);
  revalidatePath("/", "layout");
  return actionSuccess(result.rowCount > 0 ? "Semua notifikasi ditandai sudah dibaca." : "Tidak ada notifikasi baru.");
}
