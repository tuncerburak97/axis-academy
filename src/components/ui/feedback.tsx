// src/components/ui/feedback.tsx — boş durum, satır içi uyarı ve yükleniyor iskeleti
import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** Boş durum: ne olmadığını değil, sıradaki adımı söyler */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-paper/60 px-6 py-12 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <Icon className="size-6" aria-hidden />
        </span>
      )}
      <p className="mt-4 text-base font-semibold text-ink">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-soft">{description}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

const alertStyles = {
  info: { box: "bg-info-soft text-info-ink", icon: Info },
  success: { box: "bg-success-soft text-success-ink", icon: CheckCircle2 },
  warning: { box: "bg-amber-soft text-amber-ink", icon: AlertTriangle },
  danger: { box: "bg-danger-soft text-danger-ink", icon: XCircle },
} as const;

/** Sayfa içi kalıcı uyarı; geçici sonuçlar için toast kullan */
export function Alert({
  tone = "info",
  title,
  children,
  action,
  className,
}: {
  tone?: keyof typeof alertStyles;
  title?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const { box, icon: Icon } = alertStyles[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("flex gap-3 rounded-2xl px-4 py-3.5 text-sm", box, className)}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn("leading-relaxed", title && "mt-0.5 opacity-90")}>{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}

/** Yükleniyor iskeleti */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-lg bg-line/70", className)} />;
}
