import { cn } from "@/lib/utils/cn";

/**
 * Kartu kaca untuk halaman autentikasi.
 * size="sm" (login, lupa password) atau size="lg" (register, landscape).
 */
export function AuthCard({ size = "sm", className, children }) {
  return (
    <div
      className={cn(
        "auth-glass w-full",
        size === "lg" ? "max-w-5xl px-6 py-9 sm:px-10 lg:px-12" : "max-w-lg px-6 py-10 sm:px-12",
        className,
      )}
    >
      {children}
    </div>
  );
}
