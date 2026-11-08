// src/components/panel/use-action-toast.ts — sunucu aksiyonu sonucunu toast olarak gösterir
"use client";

import { useEffect, useRef } from "react";
import { toast } from "@/components/ui/toast";
import type { ActionState } from "@/lib/queries/member-types";

export function useActionToast(state: ActionState, onSuccess?: () => void) {
  const callback = useRef(onSuccess);
  callback.current = onSuccess;

  useEffect(() => {
    if (!state.at) return;
    if (state.status === "success") {
      toast.success(state.message ?? "Kaydedildi");
      callback.current?.();
    } else if (state.status === "error") {
      toast.error(state.message ?? "Bir şeyler ters gitti. Tekrar dene.");
    }
  }, [state.at, state.status, state.message]);
}
