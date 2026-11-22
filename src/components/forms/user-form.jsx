"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { FormField, FormMessage, SubmitButton } from "./form-field";

/** Form Create/Edit User (Admin). Field: username, nama, email, password, role. */
export function UserForm({ action, user = null }) {
  const [state, formAction, pending] = useActionState(action, null);
  const errors = state?.fieldErrors ?? {};
  const values = { ...(user ?? {}), ...(state?.values ?? {}) };
  const isEdit = Boolean(user);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Nama lengkap" name="name" required defaultValue={values.name} error={errors.name} />
        <FormField label="Username" name="username" required defaultValue={values.username} error={errors.username} hint="Huruf kecil, angka, titik, atau underscore." />
        <FormField label="Email" name="email" type="email" required defaultValue={values.email} error={errors.email} />
        <FormField label="Role" name="role" error={errors.role}>
          <NativeSelect id="role" name="role" key={values.role ?? "student"} defaultValue={values.role ?? "student"} aria-invalid={Boolean(errors.role)}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </NativeSelect>
        </FormField>
        <FormField
          label={isEdit ? "Password baru" : "Password"}
          name="password"
          type="password"
          autoComplete="new-password"
          required={!isEdit}
          error={errors.password}
          hint={isEdit ? "Kosongkan jika password tidak diganti." : "Minimal 8 karakter, berisi huruf dan angka."}
        />
      </div>
      <div className="flex flex-wrap gap-3 border-t pt-5">
        <div className="w-full sm:w-48">
          <SubmitButton pending={pending} pendingText="Menyimpan...">{isEdit ? "Simpan perubahan" : "Buat user"}</SubmitButton>
        </div>
        <Button asChild variant="outline" size="lg" className="rounded-sm">
          <Link href="/admin/users">Batal</Link>
        </Button>
      </div>
    </form>
  );
}
