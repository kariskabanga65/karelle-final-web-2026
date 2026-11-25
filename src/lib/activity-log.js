import { query } from "@/lib/db";

/**
 * Mencatat satu kegiatan ke tabel activity_logs (Riwayat Aktivitas Admin).
 *
 * Dipanggil SETELAH aksi berhasil, di luar transaksi, sehingga kegagalan
 * mencatat log tidak pernah membatalkan aksi utamanya. Nama pelaku dan label
 * data disimpan sebagai salinan, jadi log tetap terbaca walaupun user atau
 * datanya kemudian dihapus. Untuk aksi hapus, isi data disimpan di details.
 */
export async function logActivity({ actor, action, entityType, entityId = null, entityLabel, details = {} }) {
  try {
    await query(
      `INSERT INTO activity_logs (actor_id, actor_name, actor_role, action, entity_type, entity_id, entity_label, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
      [actor.id, actor.name, actor.role, action, entityType, entityId, entityLabel, JSON.stringify(details)],
    );
  } catch (err) {
    console.error("[activity-log]", err);
  }
}
