import { logoutAction } from "@/actions/auth-actions";

export function LogoutButton({ className = "" }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={`rounded-md border border-primary px-4 py-2 text-sm font-medium text-foreground underline-offset-4 hover:bg-primary hover:text-primary-foreground ${className}`}
      >
        Keluar
      </button>
    </form>
  );
}
