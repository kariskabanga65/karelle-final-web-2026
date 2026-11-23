"use client";

import { Check, Copy, Printer } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";


export function CertificateToolbar({ verifyUrl }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" onClick={() => window.print()}>
        <Printer /> Cetak / Simpan PDF
      </Button>
      <Button type="button" variant="outline" onClick={copy}>
        {copied ? <Check /> : <Copy />} {copied ? "Link tersalin" : "Salin link verifikasi"}
      </Button>
    </div>
  );
}
