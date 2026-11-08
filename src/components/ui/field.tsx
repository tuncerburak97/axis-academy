// src/components/ui/field.tsx — form alanları: etiket, ipucu ve hata metni tek yerde, erişilebilir bağlantılarla
import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const controlBase =
  "w-full min-w-0 rounded-xl border border-line-strong bg-paper px-3.5 text-[15px] text-ink shadow-[0_1px_0_rgb(14_26_43/0.02)] transition-[border-color,box-shadow] duration-150 placeholder:text-ink-muted hover:border-ink-muted focus:border-accent focus:shadow-[0_0_0_4px_rgb(79_70_229/0.12)] focus:outline-none disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-soft aria-[invalid=true]:border-danger aria-[invalid=true]:focus:shadow-[0_0_0_4px_rgb(220_38_38/0.12)]";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(controlBase, "min-h-11 py-2", className)} {...props} />;
  },
);

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, rows = 4, ...props }, ref) {
    return <textarea ref={ref} rows={rows} className={cn(controlBase, "py-2.5 leading-relaxed", className)} {...props} />;
  },
);

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <div className="relative">
        <select ref={ref} className={cn(controlBase, "min-h-11 appearance-none py-2 pr-10", className)} {...props}>
          {children}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
      </div>
    );
  },
);

interface FieldProps {
  /** Alanın id'si; içteki kontrol aynı id'yi almalı */
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean }>;
}

/** Etiket + kontrol + ipucu/hata. Kontrole id, aria-describedby ve aria-invalid otomatik bağlanır. */
export function Field({ id, label, hint, error, optional, className, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-sm font-medium text-ink">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-ink-muted">İsteğe bağlı</span>}
      </label>
      {React.cloneElement(children, {
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}
      {hint && !error && (
        <p id={hintId} className="text-[13px] text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-[13px] font-medium text-danger-ink">
          {error}
        </p>
      )}
    </div>
  );
}

/** Kart görünümlü seçim kutusu (radio/checkbox); seçenekleri yan yana karşılaştırmak için */
export function ChoiceCard({
  className,
  title,
  description,
  meta,
  type = "radio",
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        "group relative flex min-w-0 cursor-pointer gap-3 rounded-2xl border border-line-strong bg-paper p-4 transition-[border-color,background-color,box-shadow] hover:border-ink-muted has-[:checked]:border-accent has-[:checked]:bg-accent-soft/60 has-[:checked]:shadow-[0_0_0_3px_rgb(79_70_229/0.12)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
        className,
      )}
    >
      <input type={type} className="peer sr-only" {...props} />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center border-2 border-line-strong bg-paper transition-colors peer-checked:border-accent peer-checked:bg-accent",
          type === "radio" ? "rounded-full" : "rounded-md",
        )}
      >
        {type === "radio" ? (
          <span className="size-2 rounded-full bg-white opacity-0 transition-opacity group-has-[:checked]:opacity-100" />
        ) : (
          <Check className="size-3.5 text-white opacity-0 transition-opacity group-has-[:checked]:opacity-100" strokeWidth={3} />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="font-semibold text-ink">{title}</span>
          {meta && <span className="tabular font-mono text-sm text-ink">{meta}</span>}
        </span>
        {description && <span className="text-sm leading-relaxed text-ink-soft">{description}</span>}
      </span>
    </label>
  );
}
