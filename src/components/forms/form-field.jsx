/**
 * Input form sederhana beserta pesan error dari server.
 * (Akan diganti komponen shadcn/ui di Tahap 4.)
 */
export function FormField({ label, name, type = "text", error, as = "input", children, ...props }) {
  const Component = as;
  const errorId = `${name}-error`;

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      {children ?? (
        <Component
          id={name}
          name={name}
          type={as === "input" ? type : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#7a1f3d] focus:ring-2 focus:ring-[#7a1f3d]/20"
          {...props}
        />
      )}
      {error && (
        <p id={errorId} className="text-sm text-red-600">
          {error[0]}
        </p>
      )}
    </div>
  );
}

export function FormMessage({ state }) {
  if (!state?.error && !state?.message) return null;
  const isError = !state.success;
  return (
    <p
      role={isError ? "alert" : "status"}
      className={`rounded-md px-3 py-2 text-sm ${isError ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
    >
      {isError ? state.error : state.message}
    </p>
  );
}

export function SubmitButton({ pending, children, pendingText = "Memproses..." }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-[#7a1f3d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#641832] disabled:opacity-60"
    >
      {pending ? pendingText : children}
    </button>
  );
}
