// src/app/(panel)/panel/loading.tsx — üye alanı sayfaları yüklenirken iskelet
import { Skeleton } from "@/components/ui/feedback";

export default function PanelLoading() {
  return (
    <div aria-busy="true" aria-label="Yükleniyor" className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-40 rounded-2xl" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    </div>
  );
}
