"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const MAX_BYTES = 2 * 1024 * 1024;
const isLocalUpload = (value) => typeof value === "string" && /^\/api\/uploads\/[\w-]+\.(jpg|png|webp)$/.test(value);
const ACCEPT = "image/jpeg,image/png,image/webp";

export function ThumbnailField({ defaultValue = "", error }) {
  const [url, setUrl] = useState(isLocalUpload(defaultValue) ? defaultValue : "");
  const [status, setStatus] = useState({ uploading: false, message: "" });
  const inputRef = useRef(null);
  const message = status.message || error;

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_BYTES) return setStatus({ uploading: false, message: "Ukuran file maksimal 2 MB." });

    setStatus({ uploading: true, message: "" });
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/uploads", { method: "POST", body });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error ?? "Upload gagal.");
      setUrl(result.url);
      setStatus({ uploading: false, message: "" });
    } catch (err) {
      setStatus({ uploading: false, message: err.message || "Upload gagal. Coba lagi." });
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="thumbnail-file">Thumbnail (opsional)</Label>
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-md bg-ink sm:w-40">
          {url ? (
            <Image src={url} alt="Pratinjau thumbnail" fill sizes="160px" className="object-cover grayscale" />
          ) : (
            <span className="absolute inset-0 grid place-items-center px-3 text-center text-xs text-white/70">Memakai foto kategori</span>
          )}
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">JPG, PNG, atau WEBP, maksimal 2 MB. Tanpa thumbnail, kartu course memakai foto kategori.</p>
          <div className="flex flex-wrap gap-2">
            <input ref={inputRef} id="thumbnail-file" type="file" accept={ACCEPT} className="sr-only" onChange={upload} aria-describedby={message ? "thumbnail-error" : undefined} />
            <Button type="button" variant="outline" size="sm" disabled={status.uploading} onClick={() => inputRef.current?.click()}>
              <ImagePlus /> {status.uploading ? "Mengunggah..." : url ? "Ganti gambar" : "Unggah gambar"}
            </Button>
            {url && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setUrl("")} disabled={status.uploading}>
                <Trash2 /> Hapus
              </Button>
            )}
          </div>
          {message && <p id="thumbnail-error" role="alert" className="text-destructive">{message}</p>}
        </div>
      </div>
      <input type="hidden" name="thumbnailUrl" value={url} />
    </div>
  );
}
