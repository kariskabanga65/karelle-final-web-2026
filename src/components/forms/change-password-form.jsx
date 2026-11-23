"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { changePasswordAction } from "@/actions/profile-actions";
import { FormMessage, SubmitButton } from "./form-field";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "./password-input";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, null);
  const formRef = useRef(null);
  const errors = state?.fieldErrors ?? {};

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      formRef.current?.reset();
    }
  }, [state]);

  const fields = [
    { name: "currentPassword", label: "Password saat ini", autoComplete: "current-password" },
    { name: "newPassword", label: "Password baru", autoComplete: "new-password", hint: "Minimal 8 karakter, berisi huruf dan angka." },
    { name: "confirmPassword", label: "Konfirmasi password baru", autoComplete: "new-password" },
  ];

  return (
    <form ref={formRef} action={formAction} className="space-y-4" noValidate>
      {!state?.success && <FormMessage state={state} />}
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <PasswordInput
            id={field.name}
            name={field.name}
            autoComplete={field.autoComplete}
            required
            aria-invalid={Boolean(errors[field.name])}
            aria-describedby={errors[field.name] ? `${field.name}-error` : field.hint ? `${field.name}-hint` : undefined}
          />
          {errors[field.name] ? (
            <p id={`${field.name}-error`} className="text-sm text-destructive">{errors[field.name][0]}</p>
          ) : field.hint ? (
            <p id={`${field.name}-hint`} className="text-xs text-muted-foreground">{field.hint}</p>
          ) : null}
        </div>
      ))}
      <div className="sm:w-48">
        <SubmitButton pending={pending} pendingText="Menyimpan...">Ganti password</SubmitButton>
      </div>
    </form>
  );
}
