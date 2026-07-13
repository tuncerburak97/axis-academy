// src/components/admin/confirm-delete-button.tsx — onaylı silme butonu (native dialog)
"use client";

import { useRef } from "react";
import { Trash2 } from "lucide-react";

interface HiddenField {
  name: string;
  value: string;
}

interface ConfirmDeleteButtonProps {
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: HiddenField[];
  label?: string;
  confirmTitle: string;
  confirmMessage: string;
  variant?: "text" | "button";
}

export function ConfirmDeleteButton({
  action,
  hiddenFields,
  label = "Sil",
  confirmTitle,
  confirmMessage,
  variant = "text",
}: ConfirmDeleteButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) dialogRef.current?.close();
  }

  const triggerClass =
    variant === "button"
      ? "inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
      : "inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-red-700 hover:underline";

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()} className={triggerClass}>
        <Trash2 className="size-4" aria-hidden />
        {label}
      </button>

      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        aria-labelledby="confirm-delete-title"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl p-0 shadow-xl backdrop:bg-ink/40"
      >
        <div className="p-6">
          <h2 id="confirm-delete-title" className="font-display text-lg font-bold tracking-tight">
            {confirmTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{confirmMessage}</p>
          <p className="mt-3 text-xs font-medium text-red-700">Bu işlem geri alınamaz.</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="min-h-11 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={() => formRef.current?.requestSubmit()}
              className="min-h-11 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Evet, Sil
            </button>
          </div>
        </div>
      </dialog>

      <form ref={formRef} action={action} className="hidden">
        {hiddenFields.map((field) => (
          <input key={field.name} type="hidden" name={field.name} value={field.value} />
        ))}
      </form>
    </>
  );
}
