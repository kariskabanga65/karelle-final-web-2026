"use client";

import { useActionState } from "react";
import { forgotPasswordAction, resetPasswordAction } from "@/actions/auth-actions";
import { FormField, FormMessage, SubmitButton } from "./form-field";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, null);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <FormField label="Email" name="email" type="email" autoComplete="email" required error={state?.fieldErrors?.email} defaultValue={state?.values?.email} />
      <SubmitButton pending={pending} pendingText="Mengirim...">
        Kirim tautan reset
      </SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ token }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, null);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <input type="hidden" name="token" value={token} />
      <FormField label="Password baru" name="password" type="password" autoComplete="new-password" required error={state?.fieldErrors?.password} />
      <FormField label="Konfirmasi password baru" name="confirmPassword" type="password" autoComplete="new-password" required error={state?.fieldErrors?.confirmPassword} />
      <SubmitButton pending={pending} pendingText="Menyimpan...">
        Simpan password baru
      </SubmitButton>
    </form>
  );
}
