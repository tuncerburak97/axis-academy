// src/app/(public)/loading.tsx — public sayfalar yüklenirken iskelet gösterimi
export default function PublicLoading() {
  return (
    <div aria-label="Yükleniyor" className="mx-auto max-w-6xl animate-pulse px-3 py-16 sm:px-6">
      <div className="mx-auto h-10 w-2/3 max-w-lg rounded-lg bg-surface" />
      <div className="mx-auto mt-4 h-4 w-1/2 max-w-md rounded bg-surface" />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-48 rounded-2xl bg-surface" />
        ))}
      </div>
    </div>
  );
}
