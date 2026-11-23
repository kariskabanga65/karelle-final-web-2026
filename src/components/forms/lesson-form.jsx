"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormField, FormMessage, SubmitButton } from "./form-field";
import { RichTextEditor } from "./rich-text-editor";

/** Form tambah/edit materi dengan Rich Text Editor. */
export function LessonForm({ action, lesson = null, cancelHref }) {
  const [state, formAction, pending] = useActionState(action, null);
  const errors = state?.fieldErrors ?? {};
  const values = { title: lesson?.title, content: lesson?.content ?? "", ...(state?.values ?? {}) };

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <FormField label="Judul materi" name="title" required maxLength={150} defaultValue={values.title} error={errors.title} placeholder="contoh: Postur Tubuh & Cara Berdiri" />

      <div className="space-y-2">
        <Label id="content-label">Isi materi</Label>
        <RichTextEditor
          // key: editor dibuat ulang dengan isi terakhir jika validasi gagal
          key={state?.values ? `v-${state.values.content?.length}` : "initial"}
          name="content"
          defaultValue={values.content}
          labelId="content-label"
          invalid={Boolean(errors.content)}
          describedBy={errors.content ? "content-error" : "content-hint"}
        />
        {errors.content ? (
          <p id="content-error" className="text-sm text-destructive">{errors.content[0]}</p>
        ) : (
          <p id="content-hint" className="text-xs text-muted-foreground">
            Gunakan toolbar untuk judul bagian, daftar, kutipan, link, dan tabel. Minimal 20 karakter.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3 border-t pt-5">
        <div className="w-full sm:w-48">
          <SubmitButton pending={pending} pendingText="Menyimpan...">{lesson ? "Simpan materi" : "Tambah materi"}</SubmitButton>
        </div>
        <Button asChild variant="outline" size="lg" className="rounded-sm">
          <Link href={cancelHref}>Batal</Link>
        </Button>
      </div>
    </form>
  );
}
