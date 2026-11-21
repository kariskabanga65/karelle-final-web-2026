"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, Lock, UserRound } from "lucide-react";
import { loginAction } from "@/actions/auth-actions";
import { Input } from "@/components/ui/input";
import { FormMessage, SubmitButton } from "./form-field";
import { PasswordInput } from "./password-input";

/** Form login: email atau username, password, dan Remember me. */
export function LoginForm({ callbackUrl }) {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const errors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />

      <div className="space-y-1.5">
        <label htmlFor="identifier" className="sr-only">Email atau username</label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/70" aria-hidden />
          <Input
            id="identifier"
            name="identifier"
            autoComplete="username"
            placeholder="Email or Username"
            defaultValue={state?.values?.identifier}
            aria-invalid={Boolean(errors.identifier)}
            className="pl-12"
          />
        </div>
        {errors.identifier && <p className="text-sm text-destructive">{errors.identifier[0]}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="sr-only">Password</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-4 z-10 size-5 -translate-y-1/2 text-white/70" aria-hidden />
          <PasswordInput id="password" name="password" autoComplete="current-password" placeholder="Password" aria-invalid={Boolean(errors.password)} className="pl-12" />
        </div>
        {errors.password && <p className="text-sm text-destructive">{errors.password[0]}</p>}
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex cursor-pointer items-center gap-2.5 text-white/75">
          <input type="checkbox" name="rememberMe" defaultChecked className="size-4 rounded accent-white" />
          Remember me
        </label>
        <Link href="/forgot-password" className="text-white/85 underline underline-offset-4 hover:text-white">
          Forgot password?
        </Link>
      </div>

      <SubmitButton pending={pending} pendingText="Logging in..." className="btn-silver h-12 rounded-xl text-base">
        Log In <ArrowRight />
      </SubmitButton>
    </form>
  );
}
