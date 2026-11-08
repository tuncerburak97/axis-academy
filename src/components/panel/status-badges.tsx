// src/components/panel/status-badges.tsx — talep ve kayıt durum rozetleri (metin + nokta)
import { Badge } from "@/components/ui/badge";
import {
  enrollmentStatusLabels,
  enrollmentStatusTone,
  requestKindLabels,
  requestStatusLabels,
  requestStatusTone,
  type EnrollmentStatus,
  type RequestKind,
  type RequestStatus,
} from "@/lib/types/platform";

export function RequestStatusBadge({ status, size }: { status: RequestStatus; size?: "sm" | "md" }) {
  return (
    <Badge tone={requestStatusTone[status] ?? "neutral"} size={size} dot>
      {requestStatusLabels[status] ?? status}
    </Badge>
  );
}

export function EnrollmentStatusBadge({ status, size }: { status: EnrollmentStatus; size?: "sm" | "md" }) {
  return (
    <Badge tone={enrollmentStatusTone[status] ?? "neutral"} size={size} dot>
      {enrollmentStatusLabels[status] ?? status}
    </Badge>
  );
}

export function RequestKindLabel({ kind }: { kind: RequestKind }) {
  return <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">{requestKindLabels[kind] ?? kind}</span>;
}
