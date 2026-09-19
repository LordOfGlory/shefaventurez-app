import { randomBytes } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { PAY_BANK_UGX, PAY_BANK_USD, PAY_MOMO, SCHOOLS, WHATSAPP_LOCAL } from "@/lib/content";
import { cleanLine, isHttpsUrl, isSafeName, TX_REF_RE } from "@/lib/security";
import { assertRateLimit, isHoneypot } from "@/lib/security.server";
import { mergeStaffEmails, staffMiddleware } from "@/lib/staff";

export type PayMethod = "bank_usd" | "bank_ugx" | "momo";

export type ProgramPrice = {
  slug: string;
  name: string;
  amount_usd: number;
  amount_ugx: number;
  price_label: string;
};
export type PaymentRow = {
  id: number;
  tx_ref: string;
  enrollment_id: number | null;
  program: string;
  name: string;
  email: string;
  phone: string;
  amount_ugx: number;
  amount_usd: number;
  currency: string;
  method: string;
  status: string;
  vip_sent: boolean;
  created_at: string;
  paid_at: string | null;
};
export type BankRails = {
  bank_name: string;
  bank_account_name: string;
  bank_usd_account: string;
  bank_ugx_account: string;
  bank_branch: string;
  bank_swift: string;
  momo_number: string;
  momo_name: string;
};
export type CheckoutState = BankRails & {
  programs: ProgramPrice[];
};
export type OrderView = BankRails & {
  status: "missing" | "pending" | "awaiting_confirm" | "paid" | "failed";
  tx_ref: string;
  program: string;
  programName: string;
  name: string;
  email: string;
  phone: string;
  amount_usd: number;
  amount_ugx: number;
  country: string;
  method: string;
  invite: string;
};
export type AdminSettings = BankRails & {
  vip_whatsapp_invite: string;
  staff_emails: string;
};

export function payMethodLabel(method: string) {
  if (method === "bank_usd") return PAY_BANK_USD;
  if (method === "bank_ugx") return PAY_BANK_UGX;
  if (method === "momo") return PAY_MOMO;
  if (!method) return "—";
  return method;
}

async function settingMap(sql: Awaited<ReturnType<typeof getSql>>) {
  const rows = await sql<{ key: string; value: string }>`select key, value from settings`;
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return map;
}

function railsFrom(map: Record<string, string>): BankRails {
  return {
    bank_name: map.bank_name || "",
    bank_account_name: map.bank_account_name || "Shefa Venturez",
    bank_usd_account: map.bank_usd_account ?? "",
    bank_ugx_account: map.bank_ugx_account ?? "",
    bank_branch: map.bank_branch ?? "",
    bank_swift: map.bank_swift ?? "",
    momo_number: map.momo_number || WHATSAPP_LOCAL,
    momo_name: map.momo_name || "Shefa Venturez",
  };
}

const emptySettings = (): AdminSettings => ({
  ...railsFrom({}),
  vip_whatsapp_invite: "",
  staff_emails: "",
});

async function loadRails(sql: Awaited<ReturnType<typeof getSql>>): Promise<BankRails> {
  return railsFrom(await settingMap(sql));
}

function programName(slug: string, fallback?: string) {
  return fallback || SCHOOLS.find((s) => s.slug === slug)?.name || slug;
}

function makeTxRef(program: string, usd: number) {
  const code = program.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8) || "PROG";
  const rand = randomBytes(4).toString("hex").toUpperCase();
  return `SHEFA-${code}-${usd}-${rand}`;
}

export const getCheckoutState = createServerFn({ method: "GET" }).handler(async (): Promise<CheckoutState> => {
  try {
    const sql = await getSql();
    const rails = await loadRails(sql);
    const rows = await sql<ProgramPrice>`
      select slug, name, amount_usd, amount_ugx, price_label from programs where status = 'published' order by sort_order`;
    const programs = rows.length
      ? rows
      : SCHOOLS.map((s) => ({
          slug: s.slug,
          name: s.name,
          amount_usd: s.amount_usd,
          amount_ugx: s.amount_ugx,
          price_label: `$${s.amount_usd}`,
        }));
    return { ...rails, programs };
  } catch {
    return {
      ...railsFrom({}),
      programs: SCHOOLS.map((s) => ({
        slug: s.slug,
        name: s.name,
        amount_usd: s.amount_usd,
        amount_ugx: s.amount_ugx,
        price_label: `$${s.amount_usd}`,
      })),
    };
  }
});

export const getAdminSettings = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async (): Promise<AdminSettings> => {
    const sql = await getSql();
    const map = await settingMap(sql);
    const base = emptySettings();
    return {
      bank_name: map.bank_name || base.bank_name,
      bank_account_name: map.bank_account_name || base.bank_account_name,
      bank_usd_account: map.bank_usd_account ?? "",
      bank_ugx_account: map.bank_ugx_account ?? "",
      bank_branch: map.bank_branch ?? "",
      bank_swift: map.bank_swift ?? "",
      momo_number: map.momo_number ?? "",
      momo_name: map.momo_name || base.momo_name,
      vip_whatsapp_invite: map.vip_whatsapp_invite ?? "",
      staff_emails: map.staff_emails ?? "",
    };
  });

const accountSchema = z
  .string()
  .max(40)
  .default("")
  .refine((v) => /^[0-9\s-]*$/.test(v), "Use digits only for account numbers");

export const saveAdminSettings = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator(
    z.object({
      bank_name: z.string().max(80).default(""),
      bank_account_name: z.string().max(80).default("Shefa Venturez"),
      bank_usd_account: accountSchema,
      bank_ugx_account: accountSchema,
      bank_branch: z.string().max(120).default(""),
      bank_swift: z
        .string()
        .max(20)
        .default("")
        .refine((v) => /^[A-Za-z0-9]*$/.test(v), "SWIFT uses letters and numbers only"),
      momo_number: z.string().max(40).default(""),
      momo_name: z.string().max(80).default(""),
      vip_whatsapp_invite: z
        .string()
        .max(400)
        .default("")
        .refine((v) => isHttpsUrl(v), "Invite links must use https"),
      staff_emails: z.string().max(2000).default(""),
    }),
  )
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const staff = mergeStaffEmails(data.staff_emails, "");
    const userRows = await sql<{ email: string }>`select email from "user" where id = ${context.userId} limit 1`;
    const keep = (userRows[0]?.email || "").trim().toLowerCase();
    const staffValue = mergeStaffEmails(staff, keep);
    const pairs: [string, string][] = [
      ["bank_name", cleanLine(data.bank_name, 80)],
      ["bank_account_name", cleanLine(data.bank_account_name, 80) || "Shefa Venturez"],
      ["bank_usd_account", data.bank_usd_account.trim()],
      ["bank_ugx_account", data.bank_ugx_account.trim()],
      ["bank_branch", cleanLine(data.bank_branch, 120)],
      ["bank_swift", data.bank_swift.trim().toUpperCase()],
      ["momo_number", data.momo_number.trim() || WHATSAPP_LOCAL],
      ["momo_name", cleanLine(data.momo_name, 80) || "Shefa Venturez"],
      ["vip_whatsapp_invite", data.vip_whatsapp_invite.trim()],
      ["staff_emails", staffValue],
    ];
    for (const [key, value] of pairs) {
      await sql`
        insert into settings (key, value, updated_at) values (${key}, ${value}, now())
        on conflict (key) do update set value = excluded.value, updated_at = now()`;
    }
    return { ok: true };
  });

export const startCheckout = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(2).max(80),
      email: z.string().email().max(120),
      phone: z.string().min(9).max(30).regex(/^[0-9+\s()-]+$/),
      notes: z.string().max(2000).default(""),
      program: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/),
      country: z.enum(["uganda", "international"]),
      honey: z.string().max(80).default(""),
    }),
  )
  .handler(async ({ data }) => {
    if (isHoneypot(data.honey)) return { ok: true as const, tx_ref: "SHEFA-HOLD-0-HONEYPOT" };
    const name = cleanLine(data.name, 80);
    const email = cleanLine(data.email, 120).toLowerCase();
    const phone = cleanLine(data.phone, 30);
    const notes = cleanLine(data.notes, 2000);
    if (!isSafeName(name)) throw new Error("This name contains characters that are not allowed.");
    assertRateLimit("checkout", 8);
    const sql = await getSql();
    let slug = data.program;
    let amount_usd = 0;
    let amount_ugx = 0;
    let found = false;
    try {
      const rows = await sql<{ slug: string; name: string; amount_usd: number; amount_ugx: number }>`
        select slug, name, amount_usd, amount_ugx from programs where slug = ${data.program} and status = 'published' limit 1`;
      if (rows[0]) {
        slug = rows[0].slug;
        amount_usd = rows[0].amount_usd;
        amount_ugx = rows[0].amount_ugx;
        found = true;
      }
    } catch {
      /* fallback */
    }
    if (!found) {
      const s = SCHOOLS.find((p) => p.slug === data.program);
      if (!s) throw new Error("Choose one academy.");
      slug = s.slug;
      amount_usd = s.amount_usd;
      amount_ugx = s.amount_ugx;
    }
    const tx_ref = makeTxRef(slug, amount_usd);
    const currency = data.country === "uganda" ? "UGX" : "USD";
    const enr = await sql<{ id: number }>`
      insert into enrollments (program, name, email, phone, notes, status, country, tx_ref)
      values (${slug}, ${name}, ${email}, ${phone}, ${notes}, 'pending_payment', ${data.country}, ${tx_ref})
      returning id`;
    const enrollment_id = enr[0]?.id ?? null;
    await sql`
      insert into payments (tx_ref, enrollment_id, program, name, email, phone, amount_ugx, amount_usd, currency, method, status)
      values (${tx_ref}, ${enrollment_id}, ${slug}, ${name}, ${email}, ${phone}, ${amount_ugx}, ${amount_usd}, ${currency}, '', 'pending')`;
    return { ok: true as const, tx_ref };
  });

async function loadOrder(txRef: string): Promise<OrderView> {
  const sql = await getSql();
  const r = await loadRails(sql);
  const map = await settingMap(sql);
  const invite = (map.vip_whatsapp_invite || "").trim();
  const rows = await sql<PaymentRow>`select * from payments where tx_ref = ${txRef} limit 1`;
  const payment = rows[0];
  if (!payment) {
    return {
      status: "missing",
      tx_ref: txRef,
      program: "",
      programName: "",
      name: "",
      email: "",
      phone: "",
      amount_usd: 0,
      amount_ugx: 0,
      country: "",
      method: "",
      invite: "",
      ...r,
    };
  }
  const enr = await sql<{ country: string; pay_method: string; status: string }>`
    select country, pay_method, status from enrollments where tx_ref = ${txRef} limit 1`;
  const e = enr[0];
  let status: OrderView["status"] = "pending";
  if (payment.status === "paid" || e?.status === "confirmed") status = "paid";
  else if (payment.status === "failed") status = "failed";
  else if (e?.status === "awaiting_confirm" || payment.status === "awaiting_confirm") status = "awaiting_confirm";
  return {
    status,
    tx_ref: payment.tx_ref,
    program: payment.program,
    programName: programName(payment.program),
    name: payment.name,
    email: payment.email,
    phone: payment.phone,
    amount_usd: payment.amount_usd,
    amount_ugx: payment.amount_ugx,
    country: e?.country || "",
    method: payment.method || e?.pay_method || "",
    invite: status === "paid" ? invite : "",
    ...r,
  };
}

export const getOrder = createServerFn({ method: "GET" })
  .validator(z.object({ tx_ref: z.string().regex(TX_REF_RE) }))
  .handler(async ({ data }) => loadOrder(data.tx_ref));

export const markPaidNotice = createServerFn({ method: "POST" })
  .validator(z.object({ tx_ref: z.string().regex(TX_REF_RE), method: z.enum(["bank_usd", "bank_ugx", "momo"]) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{ status: string }>`select status from payments where tx_ref = ${data.tx_ref} limit 1`;
    if (!rows[0]) throw new Error("Payment reference not found.");
    if (rows[0].status === "paid") return loadOrder(data.tx_ref);
    await sql`update payments set method = ${data.method}, status = 'awaiting_confirm' where tx_ref = ${data.tx_ref} and status <> 'paid'`;
    await sql`update enrollments set pay_method = ${data.method}, status = 'awaiting_confirm' where tx_ref = ${data.tx_ref} and status <> 'confirmed'`;
    return loadOrder(data.tx_ref);
  });

export const confirmPayment = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator(z.object({ tx_ref: z.string().regex(TX_REF_RE) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`update payments set status = 'paid', paid_at = now(), vip_sent = true where tx_ref = ${data.tx_ref}`;
    await sql`update enrollments set status = 'confirmed', paid_at = now() where tx_ref = ${data.tx_ref}`;
    return loadOrder(data.tx_ref);
  });

export const listPayments = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const sql = await getSql();
    return sql<PaymentRow>`
      select id, tx_ref, enrollment_id, program, name, email, phone, amount_ugx, amount_usd, currency, method, status, vip_sent, created_at, paid_at
      from payments order by created_at desc`;
  });
