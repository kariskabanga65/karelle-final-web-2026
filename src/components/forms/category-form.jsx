"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormField, FormMessage, SubmitButton } from "./form-field";

/** Form kategori. Mode tambah (di halaman daftar) atau edit (halaman sendiri). */
export function CategoryForm({ action, category = null }) {
  const [state, formAction, pending] = useActionState(action, null);
  const errors = state?.fieldErrors ?? {};
  const values = { ...(category ?? {}), ...(state?.values ?? {}) };
  const isEdit = Boolean(category);

  useEffect(() => {
    if (state?.success) toast.success(state.message);
  }, [state]);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {!state?.success && <FormMessage state={state} />}
      <FormField label="Nama kategori" name="name" required defaultValue={values.name ?? ""} error={errors.name} placeholder="contoh: Runway & Catwalk" />
      <FormField label="Deskripsi" name="description" as="textarea" rows={3} defaultValue={values.description ?? ""} error={errors.description} />
      <div className="flex flex-wrap gap-3">
        <div className="w-full sm:w-48">
          <SubmitButton pending={pending} pendingText="Menyimpan...">{isEdit ? "Simpan perubahan" : "Tambah kategori"}</SubmitButton>
        </div>
        {isEdit && (
          <Button asChild variant="outline" size="lg" className="rounded-sm">
            <Link href="/admin/categories">Batal</Link>
          </Button>
        )}
      </div>
    </form>
  );
}
