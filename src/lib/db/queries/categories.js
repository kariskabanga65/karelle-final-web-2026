import "server-only";
import { queryMany } from "@/lib/db";

export async function getAllCategories() {
  return queryMany(`SELECT id, name, slug FROM categories ORDER BY name`);
}
