// src/components/panel/profile-form.tsx — profil bilgileri güncelleme formu (client)
"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/actions/member";
import { FormField, FormStatus } from "@/components/auth/auth-card";
import type { AuthFormState } from "@/lib/types";

interface ProfileFormProps {
  fullName: string;
  phone: string;
  email: string;
}

const initialState: AuthFormState = {};

export function ProfileForm({ fullName, phone, email }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState);

  return (
    <form action={formAction} className="rounded-xl border border-line bg-white p-6 shadow-sm">
      <FormStatus error={state.error} message={state.message} />

      <div className="mt-2 space-y-4">
        <div>
          <span className="block text-sm font-medium">E-posta</span>
          <p className="mt-1 rounded-lg bg-surface px-3 py-2.5 text-sm text-ink-soft">{email}</p>
        </div>
        <ProfileField label="Ad Soyad" name="full_name" defaultValue={fullName} required />
        <ProfileField label="Telefon" name="phone" defaultValue={phone} type="tel" />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}

// FormField default değer desteklemediği için yerel varyant
function ProfileField({
  label,
  name,
  defaultValue,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  required?: boolean;
}) {
  const id = `profile-${name}`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm transition-colors focus:border-accent"
      />
    </div>
  );
}
