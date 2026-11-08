// src/components/ui/toast.tsx — işlem sonucu bildirimi (sonner); ?saved / ?error banner'larının yerini alır
"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      offset={16}
      gap={8}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-[min(92vw,380px)] items-start gap-3 rounded-2xl bg-ink px-4 py-3.5 text-sm text-white shadow-pop",
          title: "font-semibold",
          description: "mt-0.5 text-[13px] text-white/70",
          icon: "mt-0.5 [&_svg]:size-4",
          success: "[&_[data-icon]]:text-[#86efac]",
          error: "[&_[data-icon]]:text-[#fca5a5]",
          actionButton: "ml-auto rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold hover:bg-white/20",
        },
      }}
    />
  );
}

export { toast };
