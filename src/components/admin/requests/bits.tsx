// src/components/admin/requests/bits.tsx — talep rozetleri ve yaş vurgusu (sunucu/istemci ortak)
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format";
import {
  requestKindLabels,
  requestStatusAdminLabels,
  requestStatusTone,
  trainingModeLabels,
  type RequestKind,
  type RequestStatus,
  type TrainingMode,
} from "@/lib/types/platform";
import { hoursSince } from "@/components/admin/lib/time";

export function RequestStatusBadge({ status, size = "md" }: { status: RequestStatus; size?: "sm" | "md" }) {
  return (
    <Badge tone={requestStatusTone[status]} size={size} dot>
      {requestStatusAdminLabels[status]}
    </Badge>
  );
}

export function RequestKindBadge({ kind, mode }: { kind: RequestKind; mode?: string | null }) {
  return (
    <Badge tone="neutral" size="sm">
      {requestKindLabels[kind] ?? kind}
      {kind === "training" && mode ? ` · ${trainingModeLabels[mode as TrainingMode] ?? mode}` : ""}
    </Badge>
  );
}

/** Yanıtsız yeni talep 24 saati geçtiyse amber */
export function isOverdue(item: { status: string; answered: boolean; created_at: string }) {
  return item.status === "received" && !item.answered && hoursSince(item.created_at) > 24;
}

export function AgeLabel({ item, className }: { item: { status: string; answered: boolean; created_at: string; last_activity_at: string }; className?: string }) {
  const overdue = isOverdue(item);
  return (
    <span className={cn("text-xs", overdue ? "font-semibold text-amber-ink" : "text-ink-soft", className)}>
      {overdue ? `Yanıt bekliyor · ${formatRelative(item.created_at)}` : formatRelative(item.last_activity_at)}
    </span>
  );
}
