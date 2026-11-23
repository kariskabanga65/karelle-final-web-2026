import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
export const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB
export const UPLOAD_FILE_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;
export const UPLOAD_URL_PATTERN = /^\/api\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

export const CONTENT_TYPES = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
export function detectImageType(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

export async function saveUpload(bytes, ext) {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const fileName = `${randomUUID()}.${ext}`;
  await writeFile(path.join(UPLOAD_DIR, fileName), bytes, { flag: "wx" });
  return `/api/uploads/${fileName}`;
}

export async function readUpload(fileName) {
  if (!UPLOAD_FILE_PATTERN.test(fileName)) return null; 
  try {
    return await readFile(path.join(UPLOAD_DIR, fileName));
  } catch {
    return null;
  }
}

export async function removeUpload(url) {
  if (!url || !UPLOAD_URL_PATTERN.test(url)) return;
  try {
    await unlink(path.join(UPLOAD_DIR, path.basename(url)));
  } catch {
  }
}
