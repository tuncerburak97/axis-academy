// src/app/(admin)/admin/loading.tsx — admin sayfaları yüklenirken iskelet gösterimi
export default function AdminLoading() {
  return (
    <div aria-label="Yükleniyor" className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded-lg bg-surface" />
      <div className="h-4 w-72 rounded bg-surface" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-28 rounded-xl bg-surface" />
        ))}
      </div>
    </div>
  );
}
