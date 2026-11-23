"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { FormField, FormMessage, SubmitButton } from "./form-field";
import { ThumbnailField } from "./thumbnail-field";

export function CourseForm({ action, course = null, categories, teachers = null, cancelHref }) {
  const [state, formAction, pending] = useActionState(action, null);
  const errors = state?.fieldErrors ?? {};
  const values = {
    title: course?.title,
    description: course?.description,
    categoryId: course?.category_id,
    teacherId: course?.teacher_id,
    startDate: course?.start_date ?? "",
    endDate: course?.end_date ?? "",
    thumbnailUrl: course?.thumbnail_url ?? "",
    ...(state?.values ?? {}),
  };

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <FormField label="Judul course" name="title" required defaultValue={values.title} error={errors.title} />
      <FormField label="Deskripsi" name="description" as="textarea" rows={5} required defaultValue={values.description} error={errors.description} />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Kategori" name="categoryId" error={errors.categoryId}>
          <NativeSelect id="categoryId" name="categoryId" key={`c-${values.categoryId}`} defaultValue={values.categoryId ?? ""} aria-invalid={Boolean(errors.categoryId)}>
            <option value="" disabled>Pilih kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </NativeSelect>
        </FormField>

        {teachers && (
          <FormField label="Teacher" name="teacherId" error={errors.teacherId}>
            <NativeSelect id="teacherId" name="teacherId" key={`t-${values.teacherId}`} defaultValue={values.teacherId ?? ""} aria-invalid={Boolean(errors.teacherId)}>
              <option value="" disabled>Pilih teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>{teacher.name} (@{teacher.username})</option>
              ))}
            </NativeSelect>
          </FormField>
        )}
      </div>

      <ThumbnailField key={`t-${values.thumbnailUrl}`} defaultValue={values.thumbnailUrl} error={errors.thumbnailUrl?.[0]} />

      <fieldset className="space-y-3 rounded-lg border bg-card p-4">
        <legend className="px-1 text-sm font-medium">Rentang waktu (opsional)</legend>
        <p className="text-xs text-muted-foreground">Kosongkan kedua tanggal untuk kelas lifetime access.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Tanggal mulai" name="startDate" type="date" defaultValue={values.startDate} error={errors.startDate} />
          <FormField label="Tanggal selesai" name="endDate" type="date" defaultValue={values.endDate} error={errors.endDate} />
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-3 border-t pt-5">
        <div className="w-full sm:w-48">
          <SubmitButton pending={pending} pendingText="Menyimpan...">{course ? "Simpan perubahan" : "Buat course"}</SubmitButton>
        </div>
        <Button asChild variant="outline" size="lg" className="rounded-sm">
          <Link href={cancelHref}>Batal</Link>
        </Button>
      </div>
    </form>
  );
}
