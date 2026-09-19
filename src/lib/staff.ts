import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";

function parseEmails(raw: string): string[] {
  return String(raw || "")
    .split(/[,;\n]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

async function userEmail(userId: string): Promise<string> {
  try {
    const sql = await getSql();
    const rows = await sql<{ email: string }>`select email from "user" where id = ${userId} limit 1`;
    return (rows[0]?.email || "").trim().toLowerCase();
  } catch {
    return "";
  }
}

export async function staffStatus(userId: string): Promise<{ isStaff: boolean; email: string }> {
  const sql = await getSql();
  const email = await userEmail(userId);
  const ident = email || userId.toLowerCase();
  const rows = await sql<{ value: string }>`select value from settings where key = 'staff_emails' limit 1`;
  let list = parseEmails(rows[0]?.value || "");
  if (list.length === 0 && ident) {
    await sql`
      insert into settings (key, value, updated_at)
      values ('staff_emails', ${ident}, now())
      on conflict (key) do update set value = excluded.value, updated_at = now()`;
    list = [ident];
  }
  return { isStaff: list.includes(ident), email: ident };
}

export async function assertStaff(userId: string) {
  const status = await staffStatus(userId);
  if (!status.isStaff) {
    throw new Error("This account is not staff.");
  }
  return status;
}

export function mergeStaffEmails(raw: string, keepEmail: string): string {
  const list = parseEmails(raw);
  const keep = keepEmail.trim().toLowerCase();
  if (keep && !list.includes(keep)) list.unshift(keep);
  return [...new Set(list)].join(", ");
}

export const staffMiddleware = createMiddleware({ type: "function" })
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    await assertStaff(context.userId);
    return next({ context });
  });

export const getStaffSession = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => staffStatus(context.userId));
