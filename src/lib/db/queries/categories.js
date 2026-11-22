import "server-only";
import { queryMany } from "@/lib/db";

/** Semua kategori, urut nama. Dipakai untuk dropdown. */
export async function getAllCategories() {
  return queryMany(`SELECT id, name, slug FROM categories ORDER BY name`);
}
