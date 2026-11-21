"use client";

import { useActionState } from "react";
import { registerStudentAction, registerTeacherAction } from "@/actions/auth-actions";
import { NativeSelect } from "@/components/ui/native-select";
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
    <form action={formAction} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <FormField label="Nama lengkap" name="name" autoComplete="name" required error={errors.name} defaultValue={values.name} />
      <FormField label="Username" name="username" autoComplete="username" placeholder="contoh: rina.kartika" required error={errors.username} defaultValue={values.username} />
      <FormField label="Email" name="email" type="email" autoComplete="email" required error={errors.email} defaultValue={values.email} />
      <FormField label="Password" name="password" type="password" autoComplete="new-password" required error={errors.password} />
      <FormField label="Konfirmasi password" name="confirmPassword" type="password" autoComplete="new-password" required error={errors.confirmPassword} />

      {isTeacher && (
        <>
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
          <FormField label="Pengalaman" name="experience" as="textarea" rows={3} required error={errors.experience} defaultValue={values.experience} />
          <FormField label="Motivasi mengajar" name="motivation" as="textarea" rows={3} required error={errors.motivation} defaultValue={values.motivation} />
        </>
      )}

      <SubmitButton className="btn-silver h-12 rounded-xl text-base" pending={pending} pendingText="Mendaftarkan...">
        {isTeacher ? "Ajukan sebagai Teacher" : "Daftar sebagai Student"}
      </SubmitButton>
    </form>
  );
}
