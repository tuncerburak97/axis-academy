// src/components/admin/admin-form-dialog.tsx — ortalanmış form modal (native dialog)
"use client";

import { useRef, type ReactNode } from "react";

interface AdminFormDialogProps {
  title: string;
  triggerLabel: string;
  triggerIcon?: ReactNode;
  triggerVariant?: "primary" | "secondary" | "text";
  children: ReactNode;
  description?: string;
  size?: "md" | "lg";
}

const triggerVariants = {
  primary:
    "inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong",
  secondary:
    "inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-surface",
  text: "inline-flex min-h-11 items-center text-sm font-semibold text-accent hover:underline",
};

export function AdminFormDialog({
  title,
  triggerLabel,
  triggerIcon,
  triggerVariant = "secondary",
  children,
  description,
  size = "md",
}: AdminFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const maxWidth = size === "lg" ? "max-w-2xl" : "max-w-lg";

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) dialogRef.current?.close();
  }

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()} className={triggerVariants[triggerVariant]}>
        {triggerIcon}
        {triggerLabel}
      </button>
      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        aria-labelledby="admin-form-dialog-title"
        className={`m-auto w-[calc(100%-2rem)] ${maxWidth} rounded-2xl p-0 shadow-xl backdrop:bg-ink/40`}
      >
        <div className="max-h-[min(85vh,720px)] overflow-y-auto p-6">
          <h2 id="admin-form-dialog-title" className="font-display text-lg font-bold tracking-tight">
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
          <div className="mt-5">{children}</div>
        </div>
      </dialog>
    </>
  );
}
