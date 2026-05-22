import { createHash } from "crypto";

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

export function getClientIp(request: Request): string {
  // On Vercel, x-real-ip is set by the edge network and cannot be spoofed by the client.
  // x-forwarded-for is a fallback (Vercel prepends the real IP, so first value is trusted).
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
