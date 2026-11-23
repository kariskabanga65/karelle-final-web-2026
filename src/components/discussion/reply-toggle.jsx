"use client";

import { useState } from "react";
import { Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommentForm } from "./comment-form";

export function ReplyToggle({ contentId, parentId, authorName }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={() => setOpen(true)}>
        <Reply /> Balas
      </Button>
    );
  }
  return (
    <div className="mt-3 w-full">
      <CommentForm contentId={contentId} parentId={parentId} compact autoFocus placeholder={`Balas ${authorName}...`} onDone={() => setOpen(false)} />
    </div>
  );
}
