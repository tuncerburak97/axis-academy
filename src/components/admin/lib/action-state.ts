// src/components/admin/lib/action-state.ts — admin Server Action sonuç sözleşmesi (istemci + sunucu ortak)
export interface ActionState {
  ok?: boolean;
  error?: string;
  /** Başarı toast'ı */
  message?: string;
  /** Başarıdan sonra istemcinin gideceği adres */
  redirectTo?: string;
  /** Her yanıtta değişir; aynı mesaj iki kez gelse de toast tetiklenir */
  at?: number;
}

export type AdminAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export const idleState: ActionState = {};
