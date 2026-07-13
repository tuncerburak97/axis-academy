// src/lib/types.ts — Server Action sonuç sözleşmeleri
export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// useActionState ile kullanılan form durumu; message bilgilendirme (örn. "e-postanı kontrol et") taşır
export interface AuthFormState {
  error?: string;
  message?: string;
}
