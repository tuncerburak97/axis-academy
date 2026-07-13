// src/components/admin/admin-logout-button.tsx — admin çıkış butonu (server action form)
import { logout } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

interface AdminLogoutButtonProps {
  className?: string;
}

export function AdminLogoutButton({ className }: AdminLogoutButtonProps) {
  return (
    <form action={logout}>
      <button
        type="submit"
        className={cn(
          "w-full min-h-11 rounded-lg border border-line px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-surface",
          className,
        )}
      >
        Çıkış Yap
      </button>
    </form>
  );
}
