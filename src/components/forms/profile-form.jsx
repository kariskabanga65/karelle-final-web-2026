"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateProfileAction } from "@/actions/profile-actions";
import { FormField, FormMessage, SubmitButton } from "./form-field";


export function ProfileForm({ user }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, null);
  const errors = state?.fieldErrors ?? {};
  const values = { name: user.name, headline: user.headline ?? "", bio: user.bio ?? "", ...(state?.values ?? {}) };

  useEffect(() => {
    if (state?.success) toast.success(state.message);
  }, [state]);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {!state?.success && <FormMessage state={state} />}
      <FormField label="Nama lengkap" name="name" required maxLength={100} autoComplete="name" defaultValue={values.name} error={errors.name} key={`n-${values.name}`} />
      <FormField label="Headline" name="headline" maxLength={120} placeholder="contoh: Model Runway & Brand Ambassador" defaultValue={values.headline ?? ""} error={errors.headline} key={`h-${values.headline}`} />
      <FormField label="Bio" name="bio" as="textarea" rows={4} maxLength={500} placeholder="Ceritakan sedikit tentang diri Anda." defaultValue={values.bio ?? ""} error={errors.bio} key={`b-${values.bio}`} />
      <div className="sm:w-48">
        <SubmitButton pending={pending} pendingText="Menyimpan...">Simpan profil</SubmitButton>
      </div>
    </form>
  );
}
