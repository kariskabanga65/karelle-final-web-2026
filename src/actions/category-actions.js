"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authorizeAction } from "@/lib/auth/action-guard";
import { ROLES } from "@/lib/auth/roles";
import { query } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";
import { getDbErrorMessage } from "@/lib/db/errors";
import { actionError, actionSuccess, formDataToObject, validationError } from "@/lib/utils/action-result";
import { isUuid, slugify } from "@/lib/utils/slug";
import { categorySchema } from "@/lib/validations/category";

/** Category Management (khusus Admin). */

export async function createCategoryAction(_prevState, formData) {
  const { user: admin, error } = await authorizeAction([ROLES.ADMIN]);
  if (error) return error;

  const input = formDataToObject(formData);
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error, input);

  try {
    const created = await query(
      `INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING id`,
      [parsed.data.name, slugify(parsed.data.name), parsed.data.description || null],
    );
    await logActivity({
      actor: admin, action: "create", entityType: "category", entityId: created.rows[0].id,
      entityLabel: parsed.data.name, details: { deskripsi: parsed.data.description || null },
    });
  } catch (err) {
    return actionError(getDbErrorMessage(err, "Gagal menambah kategori."), {}, input);
  }

  revalidateCategories();
  // Tanpa "values": form dikosongkan lagi setelah berhasil.
  return actionSuccess(`Kategori "${parsed.data.name}" ditambahkan.`);
}

export async function updateCategoryAction(categoryId, _prevState, formData) {
  const { user: admin, error } = await authorizeAction([ROLES.ADMIN]);
  if (error) return error;
  if (!isUuid(categoryId)) return actionError("Kategori tidak valid.");

  const input = formDataToObject(formData);
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error, input);

  try {
    const before = await query(`SELECT name, description FROM categories WHERE id = $1`, [categoryId]);
    const result = await query(
      `UPDATE categories SET name = $1, slug = $2, description = $3 WHERE id = $4`,
      [parsed.data.name, slugify(parsed.data.name), parsed.data.description || null, categoryId],
    );
    if (result.rowCount === 0) return actionError("Kategori tidak ditemukan.", {}, input);
    await logActivity({
      actor: admin, action: "update", entityType: "category", entityId: categoryId, entityLabel: parsed.data.name,
      details: {
        nama: { dari: before.rows[0]?.name, menjadi: parsed.data.name },
        deskripsi: { dari: before.rows[0]?.description ?? null, menjadi: parsed.data.description || null },
      },
    });
  } catch (err) {
    return actionError(getDbErrorMessage(err, "Gagal menyimpan kategori."), {}, input);
  }

  revalidateCategories();
  redirect("/admin/categories?success=updated");
}

/**
 * Kategori yang masih dipakai course TIDAK bisa dihapus
 * (foreign key ON DELETE RESTRICT di database).
 */
export async function deleteCategoryAction(categoryId) {
  const { user: admin, error } = await authorizeAction([ROLES.ADMIN]);
  if (error) return error;
  if (!isUuid(categoryId)) return actionError("Kategori tidak valid.");

  try {
    const result = await query(`DELETE FROM categories WHERE id = $1 RETURNING name, description`, [categoryId]);
    if (result.rowCount === 0) return actionError("Kategori tidak ditemukan.");
    await logActivity({
      actor: admin, action: "delete", entityType: "category", entityId: categoryId,
      entityLabel: result.rows[0].name, details: { deskripsi: result.rows[0].description },
    });
    revalidateCategories();
    return actionSuccess(`Kategori "${result.rows[0].name}" dihapus.`);
  } catch (err) {
    return actionError(getDbErrorMessage(err, "Gagal menghapus kategori."));
  }
}

function revalidateCategories() {
  revalidatePath("/admin/categories");
  revalidatePath("/courses");
  revalidatePath("/");
}
