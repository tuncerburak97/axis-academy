// src/components/panel/account-forms.tsx — hesap ayarları: profil, e-posta tercihi, şifre, hesabı silme
"use client";

import { useActionState, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  changePasswordAction,
  deleteAccountAction,
  updateEmailPreferenceAction,
  updateProfileAction,
} from "@/lib/actions/member";
import { idleState } from "@/lib/queries/member-types";
import { useActionToast } from "@/components/panel/use-action-toast";

export function ProfileForm({ fullName, phone, email }: { fullName: string; phone: string; email: string }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, idleState);
  useActionToast(state);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="full_name" label="Ad soyad" error={state.fieldErrors?.full_name} hint="Belgelerinde bu ad yazar.">
          <Input name="full_name" defaultValue={fullName} autoComplete="name" required minLength={2} maxLength={100} />
        </Field>
        <Field id="phone" label="Telefon" optional error={state.fieldErrors?.phone} hint="Ders planlaması için ulaşmamız gerekirse.">
          <Input name="phone" type="tel" defaultValue={phone} autoComplete="tel" inputMode="tel" maxLength={20} placeholder="05xx xxx xx xx" />
        </Field>
      </div>
      <Field id="email" label="E-posta" hint="E-posta adresini değiştirmek için destek ekibine yaz.">
        <Input value={email} disabled readOnly />
      </Field>
      <div>
        <Button type="submit" loading={pending}>
          Kaydet
        </Button>
      </div>
    </form>
  );
}

export function EmailPreferenceForm({ enabled }: { enabled: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [checked, setChecked] = useState(enabled);
  const [state, formAction, pending] = useActionState(updateEmailPreferenceAction, idleState);
  useActionToast(state);
  return (
    <form ref={formRef} action={formAction}>
      <label className="flex cursor-pointer items-start justify-between gap-4">
        <span className="min-w-0">
          <span className="block text-sm font-semibold">E-posta bildirimleri</span>
          <span className="mt-0.5 block text-sm text-ink-soft">
            Teklif, mesaj, kayıt onayı ve teslim dosyası gibi gelişmeleri e-postayla da al. Panel bildirimleri her zaman açıktır.
          </span>
        </span>
        <span className="relative mt-0.5 inline-flex shrink-0">
          <input
            type="checkbox"
            name="email_notifications"
            role="switch"
            aria-checked={checked}
            checked={checked}
            disabled={pending}
            onChange={(event) => {
              setChecked(event.currentTarget.checked);
              requestAnimationFrame(() => formRef.current?.requestSubmit());
            }}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className="h-7 w-12 rounded-full bg-line-strong transition-colors peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent peer-disabled:opacity-60"
          />
          <span
            aria-hidden
            className="absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"
          />
        </span>
      </label>
    </form>
  );
}

export function PasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(changePasswordAction, idleState);
  useActionToast(state, () => formRef.current?.reset());
  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="password" label="Yeni şifre" hint="En az 8 karakter." error={state.fieldErrors?.password}>
          <Input name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={72} />
        </Field>
        <Field id="confirm" label="Yeni şifre (tekrar)" error={state.fieldErrors?.confirm}>
          <Input name="confirm" type="password" autoComplete="new-password" required minLength={8} maxLength={72} />
        </Field>
      </div>
      <div>
        <Button type="submit" variant="secondary" loading={pending}>
          Şifreyi değiştir
        </Button>
      </div>
    </form>
  );
}

export function DeleteAccountDialog({ email }: { email: string }) {
  const [typed, setTyped] = useState("");
  const [state, formAction, pending] = useActionState(deleteAccountAction, idleState);
  useActionToast(state);
  const matches = typed.trim().toLocaleLowerCase("tr-TR") === email.toLocaleLowerCase("tr-TR");
  return (
    <Dialog onOpenChange={(open) => !open && setTyped("")}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-danger/40 text-danger-ink hover:border-danger hover:bg-danger-soft">
          <Trash2 aria-hidden /> Hesabımı sil
        </Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <form action={formAction} className="flex min-h-0 flex-col">
          <DialogHeader>
            <DialogTitle>Hesabını kalıcı olarak sil</DialogTitle>
            <DialogDescription>
              Profilin, talep geçmişin, mesajların, dosyaların, kayıtların ve belgelerin silinir. Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Field id="delete-confirm" label={<>Onaylamak için e-posta adresini yaz: <span className="font-mono text-ink-soft">{email}</span></>} error={state.fieldErrors?.confirm}>
              <Input name="confirm" value={typed} onChange={(event) => setTyped(event.currentTarget.value)} autoComplete="off" spellCheck={false} />
            </Field>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Vazgeç
              </Button>
            </DialogClose>
            <Button type="submit" variant="danger" disabled={!matches} loading={pending}>
              Hesabımı kalıcı olarak sil
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
