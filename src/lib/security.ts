/** Shared input hygiene — no secrets, no HTML execution. */

const CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export const TX_REF_RE = /^SHEFA-[A-Z]+-\d+-[A-Z0-9]{4,12}$/;

export function cleanLine(value: string, max: number): string {
  return String(value || "")
    .replace(CTRL, "")
    .replace(/[\r\n]+/g, " ")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, max);
}

export function cleanMultiline(value: string, max: number): string {
  return String(value || "")
    .replace(CTRL, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, max);
}

export function looksLikeInjection(value: string): boolean {
  const v = String(value || "").toLowerCase();
  return /(\b(select|insert|update|delete|drop|union|alter|exec|sleep)\b\s)|(--|\/\*|\*\/)|(['"]\s*or\s+['"]?\d)|(<script|<\/script|javascript:|onerror\s*=)/i.test(
    v,
  );
}

export function isSafeName(value: string): boolean {
  return /^[\p{L}\s.'-]{2,80}$/u.test(value);
}

/** Seed articles are <p> only. Strip every tag so stored HTML cannot run. */
export function htmlToParagraphs(html: string): string[] {
  const safe = String(html || "").replace(CTRL, "");
  return safe
    .split(/<\/p>/i)
    .map((chunk) =>
      chunk
        .replace(/<p[^>]*>/gi, "")
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&/g, "&")
        .replace(/</g, "<")
        .replace(/>/g, ">")
        .replace(/"/g, '"')
        .trim(),
    )
    .filter(Boolean)
    .slice(0, 40);
}

export function isHttpsUrl(value: string): boolean {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

export function isSafeHref(value: string): boolean {
  if (!value) return true;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return true;
  return isHttpsUrl(value);
}

export function bodyToParagraphs(text: string): string[] {
  const raw = String(text || "").replace(CTRL, "");
  if (!raw.trim()) return [];
  if (/<\/p>|<p[\s>]/i.test(raw)) return htmlToParagraphs(raw);
  return raw
    .split(/\n\s*\n/)
    .map((s) =>
      s
        .replace(/[<>]/g, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean)
    .slice(0, 40);
}

export function slugify(value: string): string {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

