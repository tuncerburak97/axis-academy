// src/app/(panel)/panel/loading.tsx — panel sayfaları yüklenirken iskelet gösterimi
export default function PanelLoading() {
  return (
    <div aria-label="Yükleniyor" className="animate-pulse space-y-6">
      <div className="h-8 w-56 rounded-lg bg-surface" />
      <div className="h-4 w-80 rounded bg-surface" />
      <div className="space-y-4">
        <div className="h-32 rounded-xl bg-surface" />
        <div className="h-32 rounded-xl bg-surface" />
      </div>
    </div>
  );
}
