// src/components/panel/confirm-action.tsx — geri alınamayan işlemler için onay diyaloğu (window.confirm yerine)
"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
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
import { idleState, type ActionState } from "@/lib/queries/member-types";
import { useActionToast } from "@/components/panel/use-action-toast";

export interface ConfirmActionProps {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  fields: Record<string, string>;
  /** Tetik butonunun içeriği */
  trigger: React.ReactNode;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
  triggerClassName?: string;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  /** Başarıdan sonra gidilecek adres (ör. kayıt silindiyse liste) */
  successHref?: string;
}

export function ConfirmAction({
  action,
  fields,
  trigger,
  triggerVariant = "outline",
  triggerSize,
  triggerClassName,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel = "Vazgeç",
  tone = "danger",
  successHref,
}: ConfirmActionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, idleState);
  useActionToast(state, () => {
    setOpen(false);
    if (successHref) router.push(successHref);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize} className={triggerClassName}>
          {trigger}
        </Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <form action={formAction} className="flex min-h-0 flex-col">
          {Object.entries(fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          {children && <DialogBody>{children}</DialogBody>}
          <DialogFooter className={children ? undefined : "mt-4"}>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                {cancelLabel}
              </Button>
            </DialogClose>
            <Button type="submit" variant={tone === "danger" ? "danger" : "primary"} loading={pending}>
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
