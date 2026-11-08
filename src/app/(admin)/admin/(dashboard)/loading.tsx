// src/app/(admin)/admin/(dashboard)/loading.tsx — konsol sayfaları yüklenirken iskelet (kenar çubuğu yerinde kalır)
import { Skeleton } from "@/components/ui/feedback";

export default function AdminLoading() {
  return (
    <div aria-busy aria-label="Yükleniyor" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
