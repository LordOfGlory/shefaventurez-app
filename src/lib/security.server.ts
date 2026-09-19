import { getRequest } from "@tanstack/react-start/server";

type Bucket = { n: number; reset: number };

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 10 * 60 * 1000;

function clientKey(): string {
  const req = getRequest();
  if (!req) return "unknown";
  const h = req.headers;
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = h.get("x-real-ip")?.trim();
  return forwarded || real || "unknown";
}

/** Per-action cap. Fails closed on abuse; in-memory (preview + one server). */
export function assertRateLimit(action: string, max: number): void {
  const now = Date.now();
  const key = `${action}:${clientKey()}`;
  const cur = buckets.get(key);
  if (!cur || now > cur.reset) {
    buckets.set(key, { n: 1, reset: now + WINDOW_MS });
    return;
  }
  if (cur.n >= max) {
    throw new Error("Please wait a few minutes and try again.");
  }
  cur.n += 1;
}

export function isHoneypot(value: string | undefined | null): boolean {
  return Boolean(value && String(value).trim());
}
