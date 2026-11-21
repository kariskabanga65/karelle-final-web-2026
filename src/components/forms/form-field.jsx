import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Field form (label + input + pesan error dari server).
 * as="textarea" untuk teks panjang, atau kirim children untuk input khusus.
 */
export function FormField({ label, name, type = "text", error, as = "input", hint, children, ...props }) {
  const errorId = `${name}-error`;
  const shared = {
    id: name,
    name,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
    ...props,
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {children ?? (as === "textarea" ? <Textarea {...shared} /> : <Input type={type} {...shared} />)}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error[0]}
        </p>
      )}
    </div>
  );
}

export function FormMessage({ state }) {
  if (!state?.error && !state?.message) return null;
  const isError = !state.success;
  const Icon = isError ? AlertCircle : CheckCircle2;
  return (
    <p
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-md border px-3.5 py-3 text-sm ${isError ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-success/30 bg-success/5 text-success"}`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      {isError ? state.error : state.message}
    </p>
  );
}

export function SubmitButton({ pending, children, pendingText = "Memproses...", className = "" }) {
  return (
    <Button type="submit" size="lg" disabled={pending} className={`w-full rounded-sm ${className}`}>
      {pending && <Loader2 className="animate-spin" />}
      {pending ? pendingText : children}
    </Button>
  );
}
