import "server-only";
import { headers } from "next/headers";

export async function getVerifyUrl(certificateNumber) {
  const base = process.env.NEXT_PUBLIC_APP_URL || (await originFromHeaders());
  return `${base.replace(/\/$/, "")}/certificates/verify/${certificateNumber}`;
}

async function originFromHeaders() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
