import { logoutAction } from "@/actions/auth-actions";

export function LogoutButton({ className = "" }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={`rounded-md border border-[#7a1f3d] px-4 py-2 text-sm font-medium text-[#7a1f3d] hover:bg-[#7a1f3d] hover:text-white ${className}`}
      >
        Keluar
      </button>
    </form>
  );
}
