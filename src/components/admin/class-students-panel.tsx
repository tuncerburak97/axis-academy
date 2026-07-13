// src/components/admin/class-students-panel.tsx — sınıf öğrenci listesi + onay
import { approveEnrollment, rejectEnrollment } from "@/lib/actions/admin-classes";
import { enrollmentStatusLabels } from "@/lib/types/catalog";
import type { ClassEnrollmentRow, EnrollmentStatus } from "@/lib/types/catalog";

interface ClassStudentsPanelProps {
  classId: string;
  enrollments: ClassEnrollmentRow[];
}

const statusStyles: Record<EnrollmentStatus, string> = {
  pending: "bg-amber-soft text-amber-900",
  enrolled: "bg-green-50 text-green-800",
  in_progress: "bg-accent-soft text-accent",
  completed: "bg-surface text-ink-soft",
  cancelled: "bg-surface text-ink-soft/70",
};

export function ClassStudentsPanel({ classId, enrollments }: ClassStudentsPanelProps) {
  const pending = enrollments.filter((e) => e.status === "pending");
  const active = enrollments.filter((e) => !["pending", "cancelled"].includes(e.status));
  const cancelled = enrollments.filter((e) => e.status === "cancelled");

  const returnTo = `/admin/siniflar/${classId}?tab=students&saved=1`;

  if (enrollments.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-white p-6 text-sm text-ink-soft">
        Bu sınıfta henüz öğrenci kaydı yok.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {pending.length > 0 && (
        <section>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-amber-900">
            Bekleyen istekler ({pending.length})
          </h3>
          <div className="mt-3 space-y-3">
            {pending.map((e) => (
              <StudentRow key={e.id} enrollment={e} classId={classId} returnTo={returnTo} showActions />
            ))}
          </div>
        </section>
      )}

      {active.length > 0 && (
        <section>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Kayıtlı öğrenciler ({active.length})
          </h3>
          <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-white shadow-sm">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-4 py-3 font-semibold">Öğrenci</th>
                  <th className="px-4 py-3 font-semibold">E-posta</th>
                  <th className="px-4 py-3 font-semibold">Durum</th>
                  <th className="px-4 py-3 font-semibold">Kayıt</th>
                </tr>
              </thead>
              <tbody>
                {active.map((e) => (
                  <StudentTableRow key={e.id} enrollment={e} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {cancelled.length > 0 && (
        <section>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">
            İptal / red ({cancelled.length})
          </h3>
          <div className="mt-3 space-y-2">
            {cancelled.map((e) => (
              <StudentRow key={e.id} enrollment={e} classId={classId} returnTo={returnTo} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StudentTableRow({ enrollment }: { enrollment: ClassEnrollmentRow }) {
  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-4 py-3 font-medium">{enrollment.profiles?.full_name || "—"}</td>
      <td className="px-4 py-3 text-ink-soft">{enrollment.profiles?.email || "—"}</td>
      <td className="px-4 py-3">
        <StatusBadge status={enrollment.status} />
      </td>
      <td className="px-4 py-3 text-ink-soft">
        {new Date(enrollment.created_at).toLocaleDateString("tr-TR")}
      </td>
    </tr>
  );
}

function StudentRow({
  enrollment,
  classId,
  returnTo,
  showActions = false,
}: {
  enrollment: ClassEnrollmentRow;
  classId: string;
  returnTo: string;
  showActions?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm">
        <p className="font-semibold">{enrollment.profiles?.full_name || "İsimsiz"}</p>
        <p className="text-ink-soft">{enrollment.profiles?.email}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
          <span>{new Date(enrollment.created_at).toLocaleDateString("tr-TR")}</span>
          {!showActions && <StatusBadge status={enrollment.status} />}
        </div>
      </div>
      {showActions && (
        <div className="flex gap-2">
          <form action={approveEnrollment}>
            <input type="hidden" name="enrollment_id" value={enrollment.id} />
            <input type="hidden" name="class_id" value={classId} />
            <input type="hidden" name="return_to" value={returnTo} />
            <button type="submit" className="min-h-11 rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
              Onayla
            </button>
          </form>
          <form action={rejectEnrollment}>
            <input type="hidden" name="enrollment_id" value={enrollment.id} />
            <input type="hidden" name="class_id" value={classId} />
            <input type="hidden" name="return_to" value={returnTo} />
            <button type="submit" className="min-h-11 rounded-lg border border-line px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
              Reddet
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: EnrollmentStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[status]}`}>
      {enrollmentStatusLabels[status]}
    </span>
  );
}
