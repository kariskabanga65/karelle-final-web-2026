"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { FormField, FormMessage, SubmitButton } from "./form-field";

/**
 * Form Create/Edit User (Admin).
 * - Role yang bisa dipilih hanya Student dan Teacher. Akun Admin disediakan
 *   langsung oleh sistem, jadi role Admin hanya ditampilkan (tidak bisa diubah).
 * - Menjadi Teacher (user baru, atau Student yang diubah) memunculkan field yang
 *   sama dengan form register Teacher: bidang keahlian, pengalaman, motivasi.
 * - Teacher yang diubah menjadi Student: data tersebut akan dihapus.
 */
export function UserForm({ action, user = null, categories = [], application = null }) {
  const [state, formAction, pending] = useActionState(action, null);
  const errors = state?.fieldErrors ?? {};
  // Isian pengajuan pending (jika ada) dipakai sebagai nilai awal field Teacher.
  const values = {
    expertise: application?.expertise,
    experience: application?.experience,
    motivation: application?.motivation,
    ...(user ?? {}),
    ...(state?.values ?? {}),
  };
  const isEdit = Boolean(user);
  const isAdminAccount = user?.role === "admin";
  // Tidak dibuat controlled: React me-reset form setelah action, jadi pilihan
  // dikembalikan lewat defaultValue + key agar sama dengan yang terakhir dikirim.
  const [role, setRole] = useState(values.role ?? "student");
  const showTeacherFields = role === "teacher" && (!isEdit || user.role === "student");
  const willRemoveTeacherData = isEdit && user.role === "teacher" && role === "student";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Nama lengkap" name="name" required defaultValue={values.name} error={errors.name} />
        <FormField label="Username" name="username" required defaultValue={values.username} error={errors.username} hint="Huruf kecil, angka, titik, atau underscore." />
        <FormField label="Email" name="email" type="email" required defaultValue={values.email} error={errors.email} />

        {isAdminAccount ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Role</p>
            <p className="flex h-11 items-center rounded-md border border-input bg-muted/40 px-3.5 text-[0.95rem]">Admin</p>
            <p className="text-xs text-muted-foreground">Akun Admin disediakan langsung oleh sistem, role-nya tidak dapat diubah.</p>
          </div>
        ) : (
          <FormField
            label="Role"
            name="role"
            error={errors.role}
            hint={willRemoveTeacherData ? "Data bidang keahlian, pengalaman, dan motivasi akan dihapus." : undefined}
          >
            <NativeSelect
              id="role"
              name="role"
              key={values.role ?? "student"}
              defaultValue={role}
              onChange={(event) => setRole(event.target.value)}
              aria-invalid={Boolean(errors.role)}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </NativeSelect>
          </FormField>
        )}

        {showTeacherFields && (
          <FormField label="Bidang keahlian" name="expertise" error={errors.expertise}>
            <NativeSelect
              id="expertise"
              name="expertise"
              required
              key={values.expertise ?? "empty"}
              defaultValue={values.expertise ?? ""}
              aria-invalid={Boolean(errors.expertise)}
            >
              <option value="" disabled>
                Pilih bidang kursus
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </NativeSelect>
          </FormField>
        )}

        <FormField
          label={isEdit ? "Password baru" : "Password"}
          name="password"
          type="password"
          autoComplete="new-password"
          required={!isEdit}
          error={errors.password}
          hint={isEdit ? "Kosongkan jika password tidak diganti." : "Minimal 8 karakter, berisi huruf dan angka."}
        />
        {!isEdit && (
          <FormField label="Konfirmasi password" name="confirmPassword" type="password" autoComplete="new-password" required error={errors.confirmPassword} />
        )}

        {showTeacherFields && (
          <>
            <div className="sm:col-span-2">
              <FormField label="Pengalaman" name="experience" as="textarea" rows={3} required error={errors.experience} defaultValue={values.experience} />
            </div>
            <div className="sm:col-span-2">
              <FormField label="Motivasi mengajar" name="motivation" as="textarea" rows={3} required error={errors.motivation} defaultValue={values.motivation} />
            </div>
          </>
        )}
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
