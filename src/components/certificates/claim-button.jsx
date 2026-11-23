"use client";

import { useTransition } from "react";
import { Award } from "lucide-react";
import { toast } from "sonner";
import { claimCertificateAction } from "@/actions/certificate-actions";
import { Button } from "@/components/ui/button";

export function ClaimCertificateButton({ courseId }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          // Jika berhasil, Server Action langsung mengarahkan ke halaman sertifikat.
          const result = await claimCertificateAction(courseId);
          if (result?.error) toast.error(result.error);
        })
      }
    >
      <Award /> {pending ? "Menerbitkan..." : "Terbitkan sertifikat"}
    </Button>
  );
}
