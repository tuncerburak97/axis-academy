// src/components/auth/auth-card.tsx — giriş/kayıt formları için ortak kart, alanlar ve Google butonu
import { loginWithGoogle } from "@/lib/actions/auth";

interface AuthCardProps {
  children: React.ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="mt-8 rounded-xl border border-line bg-white p-6 shadow-sm">
      {children}
      <div className="my-5 flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs font-medium text-ink-soft">veya</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <form action={loginWithGoogle}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-surface"
        >
          {/* Google "G" işareti */}
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
            <path fill="#EA4335" d="M12 5.38c1.61 0 3.06.55 4.2 1.64l3.16-3.16A11 11 0 0 0 2.18 7.06L5.84 9.9c.87-2.6 3.3-4.52 6.16-4.52Z" />
          </svg>
          Google ile devam et
        </button>
      </form>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  minLength?: number;
}

export function FormField({ label, name, type, autoComplete, minLength }: FormFieldProps) {
  const id = `field-${name}`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        minLength={minLength}
        className="mt-1.5 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm transition-colors focus:border-accent"
      />
    </div>
  );
}

// Form durum mesajları: hata formun hemen üstünde, ilgili bölgeye bağlı gösterilir
export function FormStatus({ error, message }: { error?: string; message?: string }) {
  if (error) {
    return (
      <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
        {error}
      </p>
    );
  }
  if (message) {
    return (
      <p role="status" className="rounded-lg bg-green-50 px-3 py-2.5 text-sm font-medium text-green-800">
        {message}
      </p>
    );
  }
  return null;
}
