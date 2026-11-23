"use client";

import { useActionState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { createCommentAction } from "@/actions/comment-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/** Form komentar / balasan diskusi. */
export function CommentForm({ contentId, parentId = null, placeholder, compact = false, onDone, autoFocus = false }) {
  const [state, formAction, pending] = useActionState(createCommentAction.bind(null, contentId, parentId), null);
  const formRef = useRef(null);
  const id = parentId ? `reply-${parentId}` : `comment-${contentId}`;
  const error = state?.fieldErrors?.body?.[0];

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      toast.success(state.message);
      onDone?.();
    } else if (state?.error && !state.fieldErrors?.body) {
      toast.error(state.error);
    }
  }, [state, onDone]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2" noValidate>
      <label htmlFor={id} className="sr-only">{parentId ? "Tulis balasan" : "Tulis komentar"}</label>
      <Textarea
        id={id}
        name="body"
        rows={compact ? 2 : 3}
        maxLength={2000}
        required
        autoFocus={autoFocus}
        placeholder={placeholder}
        defaultValue={state?.success ? "" : state?.values?.body}
        key={state?.sentAt ?? "form"}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <p id={`${id}-error`} className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2">
        {onDone && parentId && (
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>Batal</Button>
        )}
        <Button type="submit" size="sm" disabled={pending}>
          <Send /> {pending ? "Mengirim..." : parentId ? "Kirim balasan" : "Kirim"}
        </Button>
      </div>
    </form>
  );
}
