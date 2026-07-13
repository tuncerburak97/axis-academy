// src/components/admin/class-pending-panel.tsx — bekleyen katılım onayları
import { approveEnrollment, rejectEnrollment } from "@/lib/actions/admin-classes";
import type { PendingEnrollmentRow } from "@/lib/queries/admin-classes";

interface ClassPendingPanelProps {
  enrollments: PendingEnrollmentRow[];
}

export function ClassPendingPanel({ enrollments }: ClassPendingPanelProps) {
  if (enrollments.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-white p-6 text-sm text-ink-soft">
        Bekleyen katılım isteği yok.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {enrollments.map((enrollment) => (
        <div
          key={enrollment.id}
          className="flex flex-col gap-3 rounded-xl border border-line bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0 text-sm">
            <p className="font-semibold">{enrollment.profiles?.full_name || "İsimsiz kullanıcı"}</p>
            <p className="text-ink-soft">{enrollment.profiles?.email}</p>
            <p className="mt-1 break-words text-ink-soft">
              {enrollment.classes?.title} · {new Date(enrollment.created_at).toLocaleDateString("tr-TR")}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <form action={approveEnrollment} className="w-full sm:w-auto">
              <input type="hidden" name="enrollment_id" value={enrollment.id} />
              <input type="hidden" name="class_id" value={enrollment.class_id} />
              <input type="hidden" name="return_to" value="/admin/siniflar?tab=pending&saved=1" />
              <button
                type="submit"
                className="min-h-11 w-full rounded-lg bg-success px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
              >
                Onayla
              </button>
            </form>
            <form action={rejectEnrollment} className="w-full sm:w-auto">
              <input type="hidden" name="enrollment_id" value={enrollment.id} />
              <input type="hidden" name="class_id" value={enrollment.class_id} />
              <input type="hidden" name="return_to" value="/admin/siniflar?tab=pending&saved=1" />
              <button
                type="submit"
                className="min-h-11 w-full rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 sm:w-auto"
              >
                Reddet
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
