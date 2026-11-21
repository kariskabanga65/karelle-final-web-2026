"use client";

import { useActionState } from "react";
import { registerStudentAction, registerTeacherAction } from "@/actions/auth-actions";
import { FormField, FormMessage, SubmitButton } from "./form-field";

/**
 * Form register untuk Student dan Teacher.
 * variant="teacher" menambahkan field pengajuan Teacher.
 */
export function RegisterForm({ variant = "student", categories = [] }) {
  const isTeacher = variant === "teacher";
  const action = isTeacher ? registerTeacherAction : registerStudentAction;
  const [state, formAction, pending] = useActionState(action, null);
  const errors = state?.fieldErrors ?? {};
  const values = state?.values ?? {};

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <FormField label="Nama lengkap" name="name" autoComplete="name" required error={errors.name} defaultValue={values.name} />
      <FormField label="Username" name="username" autoComplete="username" placeholder="contoh: rina.kartika" required error={errors.username} defaultValue={values.username} />
      <FormField label="Email" name="email" type="email" autoComplete="email" required error={errors.email} defaultValue={values.email} />
      <FormField label="Password" name="password" type="password" autoComplete="new-password" required error={errors.password} />
      <FormField label="Konfirmasi password" name="confirmPassword" type="password" autoComplete="new-password" required error={errors.confirmPassword} />

      {isTeacher && (
        <>
          <FormField label="Bidang keahlian" name="expertise" error={errors.expertise}>
            <select
              id="expertise"
              name="expertise"
              required
              key={values.expertise ?? "empty"}
              defaultValue={values.expertise ?? ""}
              aria-invalid={Boolean(errors.expertise)}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Pilih bidang kursus
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Pengalaman" name="experience" as="textarea" rows={3} required error={errors.experience} defaultValue={values.experience} />
          <FormField label="Motivasi mengajar" name="motivation" as="textarea" rows={3} required error={errors.motivation} defaultValue={values.motivation} />
        </>
      )}

      <SubmitButton pending={pending} pendingText="Mendaftarkan...">
        {isTeacher ? "Ajukan sebagai Teacher" : "Daftar sebagai Student"}
      </SubmitButton>
    </form>
  );
}
