"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/** Tombol Reject dengan modal untuk mengisi alasan penolakan (opsional). */
export function RejectApplicationButton({ action, applicantName }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleReject() {
    startTransition(async () => {
      const result = await action(reason);
      if (result?.success) {
        toast.success(result.message);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result?.error ?? "Terjadi kesalahan.");
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm"><X /> Reject</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tolak pengajuan?</AlertDialogTitle>
          <AlertDialogDescription>
            Pengajuan {applicantName} akan ditolak. Akunnya tetap aktif sebagai Student.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reject-reason">Alasan (opsional, dikirim ke pengguna)</Label>
          <Textarea id="reject-reason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} rows={3} />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
          <Button variant="destructive" onClick={handleReject} disabled={pending}>
            {pending && <Loader2 className="animate-spin" />} Tolak pengajuan
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
