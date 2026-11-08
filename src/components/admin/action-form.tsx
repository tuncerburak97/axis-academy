// src/components/admin/action-form.tsx — admin formlarının temeli: useActionState + toast, onay ve form diyalogları
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import type { ActionState, AdminAction } from "@/components/admin/lib/action-state";

const PendingContext = React.createContext(false);

/** Form gönderiliyor mu? (ActionForm içinde) */
export function useFormPending() {
  return React.useContext(PendingContext);
}

interface ActionFormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "action" | "onSubmit"> {
  action: AdminAction;
  onSuccess?: (state: ActionState) => void;
  resetOnSuccess?: boolean;
  children: React.ReactNode;
}

/**
 * Sunucu aksiyonunu useActionState ile çalıştırır, sonucu toast ile bildirir.
 * Form React'in otomatik sıfırlamasına bırakılmaz: hata olursa girilen değerler kaybolmaz.
 */
export function ActionForm({ action, onSuccess, resetOnSuccess, children, ...props }: ActionFormProps) {
  const [state, formAction, pending] = React.useActionState(action, {});
  const formRef = React.useRef<HTMLFormElement>(null);
  const router = useRouter();
  const onSuccessRef = React.useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  React.useEffect(() => {
    if (!state.at) return;
    if (state.error) {
      toast.error(state.error);
      return;
    }
    if (state.ok) {
      if (state.message) toast.success(state.message);
      if (resetOnSuccess) formRef.current?.reset();
      onSuccessRef.current?.(state);
      if (state.redirectTo) router.push(state.redirectTo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.at]);

  return (
    <PendingContext.Provider value={pending}>
      <form
        ref={formRef}
        {...props}
        onSubmit={(event) => {
          event.preventDefault();
          const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
          const formData = new FormData(event.currentTarget, submitter ?? undefined);
          React.startTransition(() => formAction(formData));
        }}
      >
        {children}
      </form>
    </PendingContext.Provider>
  );
}

/** Formun gönder butonu; işlem sürerken döner ve kilitlenir */
export function SubmitButton({ children, ...props }: ButtonProps) {
  const pending = useFormPending();
  return (
    <Button type="submit" loading={pending} {...props}>
      {children}
    </Button>
  );
}

export function Hidden({ name, value }: { name: string; value: string | number | null | undefined }) {
  return <input type="hidden" name={name} value={value ?? ""} />;
}

/** Aksiyonu formsuz çağırır (menü öğeleri, anahtarlar) */
export function useRunAction() {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const run = React.useCallback(
    (action: AdminAction, fields: Record<string, string>, after?: (state: ActionState) => void) => {
      const formData = new FormData();
      for (const [key, value] of Object.entries(fields)) formData.set(key, value);
      startTransition(async () => {
        const state = await action({}, formData);
        if (state.error) toast.error(state.error);
        else {
          if (state.message) toast.success(state.message);
          after?.(state);
          if (state.redirectTo) router.push(state.redirectTo);
        }
      });
    },
    [router],
  );
  return { run, pending };
}

interface FormDialogProps {
  trigger: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action: AdminAction;
  submitLabel?: string;
  submitVariant?: ButtonProps["variant"];
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  resetOnSuccess?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Diyalog içinde form: başarıda kapanır */
export function FormDialog({
  trigger,
  title,
  description,
  action,
  submitLabel = "Kaydet",
  submitVariant = "primary",
  size = "md",
  children,
  resetOnSuccess,
  open: controlledOpen,
  onOpenChange,
}: FormDialogProps) {
  const [innerOpen, setInnerOpen] = React.useState(false);
  const open = controlledOpen ?? innerOpen;
  const setOpen = onOpenChange ?? setInnerOpen;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent size={size}>
        <ActionForm
          action={action}
          resetOnSuccess={resetOnSuccess}
          onSuccess={() => setOpen(false)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">{children}</DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Vazgeç
            </Button>
            <SubmitButton variant={submitVariant}>{submitLabel}</SubmitButton>
          </DialogFooter>
        </ActionForm>
      </DialogContent>
    </Dialog>
  );
}

interface ConfirmActionProps {
  trigger: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action: AdminAction;
  fields: Record<string, string>;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  children?: React.ReactNode;
}

/** Geri alınamaz işlemler için onay diyaloğu */
export function ConfirmAction({
  trigger,
  title,
  description,
  action,
  fields,
  confirmLabel = "Onayla",
  tone = "danger",
  children,
}: ConfirmActionProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent size="sm">
        <ActionForm action={action} onSuccess={() => setOpen(false)} className="flex min-h-0 flex-1 flex-col">
          {Object.entries(fields).map(([name, value]) => (
            <Hidden key={name} name={name} value={value} />
          ))}
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          {children && <DialogBody className="flex flex-col gap-4">{children}</DialogBody>}
          <DialogFooter className={children ? undefined : "mt-4"}>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Vazgeç
            </Button>
            <SubmitButton variant={tone === "danger" ? "danger" : "primary"}>{confirmLabel}</SubmitButton>
          </DialogFooter>
        </ActionForm>
      </DialogContent>
    </Dialog>
  );
}

/** Değişince formu gönderen select (durum değiştirme gibi) */
export function AutoSubmitSelect({
  children,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={className}
      onChange={(event) => {
        props.onChange?.(event);
        event.currentTarget.form?.requestSubmit();
      }}
    >
      {children}
    </select>
  );
}

/** Panoya kopyalama butonu */
export function CopyButton({ value, label = "Kopyala", ...props }: { value: string; label?: string } & ButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      {...props}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          toast.success("Panoya kopyalandı");
        } catch {
          toast.error("Kopyalanamadı. Metni elle seçip kopyala.");
        }
      }}
    >
      {props.children ?? label}
    </Button>
  );
}
