import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function VerifyForm({ defaultValue = "", dark = false }) {
  return (
    <form method="get" action="/certificates/verify" role="search" className="flex flex-col gap-3 sm:flex-row">
      <label htmlFor="number" className="sr-only">Nomor sertifikat</label>
      <Input
        id="number"
        name="number"
        defaultValue={defaultValue}
        placeholder="contoh: KRL-2026-A1B2C3D4E5"
        autoComplete="off"
        spellCheck={false}
        maxLength={30}
        required
        className={dark ? "h-12 border-white/30 bg-white/10 font-mono text-white placeholder:text-white/40" : "h-12 font-mono"}
      />
      <Button type="submit" size="lg" variant={dark ? "light" : "default"} className="h-12 rounded-md">
        <Search /> Verifikasi
      </Button>
    </form>
  );
}
