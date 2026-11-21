"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/actions/auth-actions";
import { FormField, FormMessage, SubmitButton } from "./form-field";

/** Form login: email atau username, password, dan Remember me. */
export function LoginForm({ callbackUrl }) {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
      <FormField
        label="Email atau username"
        name="identifier"
        autoComplete="username"
        required
        error={state?.fieldErrors?.identifier}
        defaultValue={state?.values?.identifier}
      />
      <FormField label="Password" name="password" type="password" autoComplete="current-password" required error={state?.fieldErrors?.password} />
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="rememberMe" defaultChecked /> Ingat saya
        </label>
        <Link href="/forgot-password" className="text-[#7a1f3d] hover:underline">
          Lupa password?
        </Link>
      </div>
      <SubmitButton pending={pending} pendingText="Masuk...">
        Masuk
      </SubmitButton>
    </form>
  );
}
