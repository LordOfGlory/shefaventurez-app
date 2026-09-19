import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { staffMiddleware } from "@/lib/staff";
import { CYBER_SERVICES, IT_SERVICES, SCHOOLS } from "@/lib/content";
import { cleanLine, cleanMultiline, isSafeHref, isSafeName, looksLikeInjection, slugify } from "@/lib/security";
import { assertRateLimit, isHoneypot } from "@/lib/security.server";
import { isCorePage, isCoreProgram, mergePage, pageDefault, type PageRow } from "@/lib/page-defaults";

export type { PageRow };

export type ProgramRow = {
  id: number;
  slug: string;
  name: string;
  price_label: string;
  duration: string;
  summary: string;
  body: string;
  status: string;
  sort_order: number;
  amount_usd: number;
  amount_ugx: number;
};
export type ArticleRow = {
  id: number;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  minutes: number;
  status: string;
};
export type ServiceRow = {
  id: number;
  slug: string;
  kind: string;
  title: string;
  summary: string;
  body: string;
  status: string;
  sort_order: number;
};
export type InquiryRow = {
  id: number;
  kind: string;
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
  status: string;
  created_at: string;
};
export type EnrollmentRow = {
  id: number;
  program: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  status: string;
  created_at: string;
  tx_ref?: string | null;
  paid_at?: string | null;
  pay_method?: string;
  country?: string;
};

function schoolAsProgram(s: (typeof SCHOOLS)[number], i: number): ProgramRow {
  return {
    id: i,
    slug: s.slug,
    name: s.name,
    price_label: `$${s.amount_usd} · ≈ UGX ${s.amount_ugx.toLocaleString()}`,
    duration: s.duration,
    summary: s.summary,
    body: "New students enroll every month. One academy at a time. A place is confirmed after we see the payment by bank transfer or Uganda mobile money.",
    status: "published",
    sort_order: i,
    amount_usd: s.amount_usd,
    amount_ugx: s.amount_ugx,
  };
}

function staticServices(kind: "it" | "cyber"): ServiceRow[] {
  const list = kind === "it" ? IT_SERVICES : CYBER_SERVICES;
  const body =
    kind === "it"
      ? "Work starts with a written scope: what is in, what is out, who owns it, and what the first release is allowed to be."
      : "No testing without explicit written permission.";
  return list.map((s, i) => ({
    id: i,
    slug: s.slug,
    kind,
    title: s.title,
    summary: s.summary,
    body,
    status: "published",
    sort_order: i,
  }));
}

export const listPrograms = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const sql = await getSql();
    return sql<ProgramRow>`select * from programs where status = 'published' order by sort_order`;
  } catch {
    return SCHOOLS.map(schoolAsProgram);
  }
});

export const getProgram = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1).max(40).regex(/^[a-z0-9-]+$/) }))
  .handler(async ({ data }): Promise<ProgramRow | null> => {
    try {
      const sql = await getSql();
      const rows = await sql<ProgramRow>`select * from programs where slug = ${data.slug} limit 1`;
      if (rows[0]) return rows[0].status === "published" ? rows[0] : null;
    } catch {
      /* fallback */
    }
    const s = SCHOOLS.find((p) => p.slug === data.slug);
    return s ? schoolAsProgram(s, 0) : null;
  });

export const listAllPrograms = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const sql = await getSql();
    return sql<ProgramRow>`select * from programs order by sort_order`;
  });

const programInput = z.object({
  slug: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(80),
  price_label: z.string().max(80).default(""),
  duration: z.string().max(80).default(""),
  summary: z.string().max(500).default(""),
  body: z.string().max(20000).default(""),
  status: z.enum(["published", "draft"]).default("published"),
  sort_order: z.number().int().min(0).max(999).default(0),
  amount_usd: z.number().int().min(0).max(100000),
  amount_ugx: z.number().int().min(0).max(500000000),
});

export const upsertProgram = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator(programInput)
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const name = cleanLine(data.name, 80);
    const summary = cleanMultiline(data.summary, 500);
    const body = cleanMultiline(data.body, 20000);
    const duration = cleanLine(data.duration, 80);
    const price_label =
      cleanLine(data.price_label, 80) ||
      `$${data.amount_usd} · ≈ UGX ${data.amount_ugx.toLocaleString()}`;
    const by = context.userId;
    await sql`
      insert into programs (slug, name, price_label, duration, summary, body, status, sort_order, amount_usd, amount_ugx, updated_by)
      values (${data.slug}, ${name}, ${price_label}, ${duration}, ${summary}, ${body}, ${data.status}, ${data.sort_order}, ${data.amount_usd}, ${data.amount_ugx}, ${by})
      on conflict (slug) do update set
        name = excluded.name,
        price_label = excluded.price_label,
        duration = excluded.duration,
        summary = excluded.summary,
        body = excluded.body,
        status = excluded.status,
        sort_order = excluded.sort_order,
        amount_usd = excluded.amount_usd,
        amount_ugx = excluded.amount_ugx,
        updated_by = excluded.updated_by`;
    return { ok: true };
  });

export const deleteProgram = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator(z.object({ slug: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/) }))
  .handler(async ({ data }) => {
    if (isCoreProgram(data.slug)) {
      throw new Error("Unpublish a core academy instead of deleting it.");
    }
    const sql = await getSql();
    await sql`delete from programs where slug = ${data.slug}`;
    return { ok: true };
  });

export const listArticles = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const sql = await getSql();
    return sql<ArticleRow>`select * from articles where status = 'published' order by title`;
  } catch {
    return [];
  }
});

export const getArticle = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1).max(180).regex(/^[a-z0-9-]+$/) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<ArticleRow>`select * from articles where slug = ${data.slug} and status = 'published' limit 1`;
    return rows[0] ?? null;
  });

export const listAllArticles = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const sql = await getSql();
    return sql<ArticleRow>`select * from articles order by title`;
  });

const articleInput = z.object({
  slug: z.string().min(2).max(180).regex(/^[a-z0-9-]+$/),
  title: z.string().min(2).max(180),
  category: z.string().max(80).default(""),
  excerpt: z.string().max(400).default(""),
  body: z.string().max(20000).default(""),
  minutes: z.number().int().min(1).max(120).default(8),
  status: z.enum(["published", "draft"]).default("published"),
});

export const upsertArticle = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator(articleInput)
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const title = cleanLine(data.title, 180);
    const category = cleanLine(data.category, 80);
    const excerpt = cleanMultiline(data.excerpt, 400);
    const body = cleanMultiline(data.body, 20000);
    const by = context.userId;
    await sql`
      insert into articles (slug, title, category, excerpt, body, minutes, status, updated_by, updated_at)
      values (${data.slug}, ${title}, ${category}, ${excerpt}, ${body}, ${data.minutes}, ${data.status}, ${by}, now())
      on conflict (slug) do update set
        title = excluded.title,
        category = excluded.category,
        excerpt = excluded.excerpt,
        body = excluded.body,
        minutes = excluded.minutes,
        status = excluded.status,
        updated_by = excluded.updated_by,
        updated_at = now()`;
    return { ok: true };
  });

export const deleteArticle = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator(z.object({ slug: z.string().min(2).max(180).regex(/^[a-z0-9-]+$/) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`delete from articles where slug = ${data.slug}`;
    return { ok: true };
  });

export const getPage = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/) }))
  .handler(async ({ data }): Promise<PageRow | null> => {
    try {
      const sql = await getSql();
      const rows = await sql<PageRow>`select * from site_pages where slug = ${data.slug} limit 1`;
      if (rows[0]?.status === "published") return mergePage(data.slug, rows[0]);
      if (rows[0]) return isCorePage(data.slug) ? pageDefault(data.slug) : null;
    } catch {
      /* fallback */
    }
    return isCorePage(data.slug) ? pageDefault(data.slug) : null;
  });

export const listAllPages = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const sql = await getSql();
    return sql<PageRow>`select * from site_pages order by slug`;
  });

const pageInput = z.object({
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(180),
  eyebrow: z.string().max(80).default(""),
  heading: z.string().max(240).default(""),
  lede: z.string().max(2000).default(""),
  body: z.string().max(20000).default(""),
  cta_label: z.string().max(80).default(""),
  cta_href: z.string().max(400).default(""),
  hero_image: z.string().max(400).default(""),
  status: z.enum(["published", "draft"]).default("published"),
});

export const upsertPage = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator(pageInput)
  .handler(async ({ data, context }) => {
    if (!isSafeHref(data.cta_href)) throw new Error("CTA link must be a site path or https URL.");
    if (!isSafeHref(data.hero_image)) throw new Error("Hero image must be a site path or https URL.");
    const sql = await getSql();
    const slug = slugify(data.slug) || data.slug;
    const by = context.userId;
    await sql`
      insert into site_pages (slug, title, eyebrow, heading, lede, body, cta_label, cta_href, hero_image, status, updated_by, updated_at)
      values (
        ${slug},
        ${cleanLine(data.title, 180)},
        ${cleanLine(data.eyebrow, 80)},
        ${cleanLine(data.heading, 240)},
        ${cleanMultiline(data.lede, 2000)},
        ${cleanMultiline(data.body, 20000)},
        ${cleanLine(data.cta_label, 80)},
        ${data.cta_href.trim()},
        ${data.hero_image.trim()},
        ${data.status},
        ${by},
        now()
      )
      on conflict (slug) do update set
        title = excluded.title,
        eyebrow = excluded.eyebrow,
        heading = excluded.heading,
        lede = excluded.lede,
        body = excluded.body,
        cta_label = excluded.cta_label,
        cta_href = excluded.cta_href,
        hero_image = excluded.hero_image,
        status = excluded.status,
        updated_by = excluded.updated_by,
        updated_at = now()`;
    return { ok: true, slug };
  });

export const deletePage = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator(z.object({ slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/) }))
  .handler(async ({ data }) => {
    if (isCorePage(data.slug)) throw new Error("Core pages cannot be deleted. Draft them instead.");
    const sql = await getSql();
    await sql`delete from site_pages where slug = ${data.slug}`;
    return { ok: true };
  });

export const listServices = createServerFn({ method: "GET" })
  .validator(z.object({ kind: z.enum(["it", "cyber"]) }))
  .handler(async ({ data }): Promise<ServiceRow[]> => {
    try {
      const sql = await getSql();
      const rows = await sql<ServiceRow>`
        select * from services where kind = ${data.kind} and status = 'published' order by sort_order`;
      if (rows.length) return rows;
    } catch {
      /* fallback */
    }
    return staticServices(data.kind);
  });

export const getService = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/) }))
  .handler(async ({ data }): Promise<ServiceRow | null> => {
    try {
      const sql = await getSql();
      const rows = await sql<ServiceRow>`select * from services where slug = ${data.slug} limit 1`;
      if (rows[0]) return rows[0].status === "published" ? rows[0] : null;
    } catch {
      /* fallback */
    }
    const it = staticServices("it").find((s) => s.slug === data.slug);
    if (it) return it;
    return staticServices("cyber").find((s) => s.slug === data.slug) ?? null;
  });

export const listAllServices = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const sql = await getSql();
    return sql<ServiceRow>`select * from services order by kind, sort_order`;
  });

const serviceInput = z.object({
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  kind: z.enum(["it", "cyber"]),
  title: z.string().min(2).max(120),
  summary: z.string().max(400).default(""),
  body: z.string().max(20000).default(""),
  status: z.enum(["published", "draft"]).default("published"),
  sort_order: z.number().int().min(0).max(999).default(0),
});

export const upsertService = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator(serviceInput)
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const by = context.userId;
    await sql`
      insert into services (slug, kind, title, summary, body, status, sort_order, updated_by, updated_at)
      values (
        ${data.slug},
        ${data.kind},
        ${cleanLine(data.title, 120)},
        ${cleanMultiline(data.summary, 400)},
        ${cleanMultiline(data.body, 20000)},
        ${data.status},
        ${data.sort_order},
        ${by},
        now()
      )
      on conflict (slug) do update set
        kind = excluded.kind,
        title = excluded.title,
        summary = excluded.summary,
        body = excluded.body,
        status = excluded.status,
        sort_order = excluded.sort_order,
        updated_by = excluded.updated_by,
        updated_at = now()`;
    return { ok: true };
  });

export const deleteService = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator(z.object({ slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`delete from services where slug = ${data.slug}`;
    return { ok: true };
  });

const person = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120).transform((v) => v.trim().toLowerCase()),
  phone: z.string().max(30).regex(/^[0-9+\s()-]*$/),
});

export const createInquiry = createServerFn({ method: "POST" })
  .validator(
    person.extend({
      kind: z.enum(["contact", "consultation", "enroll"]),
      topic: z.string().max(80).default(""),
      message: z.string().min(10).max(4000),
      honey: z.string().max(80).default(""),
    }),
  )
  .handler(async ({ data }) => {
    if (isHoneypot(data.honey)) return { ok: true };
    const name = cleanLine(data.name, 80);
    const email = cleanLine(data.email, 120).toLowerCase();
    const phone = cleanLine(data.phone, 30);
    const topic = cleanLine(data.topic, 80);
    const message = cleanMultiline(data.message, 4000);
    if (!isSafeName(name) || looksLikeInjection(topic)) {
      throw new Error("This field contains characters that are not allowed.");
    }
    assertRateLimit("inquiry", 8);
    const sql = await getSql();
    await sql`insert into inquiries (kind,name,email,phone,topic,message) values (${data.kind},${name},${email},${phone},${topic},${message})`;
    return { ok: true };
  });

export const listInquiries = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const sql = await getSql();
    return sql<InquiryRow>`select * from inquiries order by created_at desc`;
  });

export const updateInquiryStatus = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator(z.object({ id: z.number().int(), status: z.enum(["new", "open", "done"]) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`update inquiries set status = ${data.status} where id = ${data.id}`;
    return { ok: true };
  });

export const listEnrollments = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const sql = await getSql();
    return sql<EnrollmentRow>`select * from enrollments order by created_at desc`;
  });

export const updateEnrollmentStatus = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator(
    z.object({
      id: z.number().int(),
      status: z.enum(["new", "contacted", "pending_payment", "awaiting_confirm", "confirmed", "closed"]),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`update enrollments set status = ${data.status} where id = ${data.id}`;
    return { ok: true };
  });

export const deleteEnrollment = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`delete from enrollments where id = ${data.id}`;
    return { ok: true };
  });

export type DownloadRow = {
  id: number;
  asset: string;
  name: string;
  email: string;
  source: string;
  created_at: string;
};

export type DownloadStats = {
  total: number;
  unique_emails: number;
  last_7_days: number;
  rows: DownloadRow[];
};

export const recordDownload = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(2).max(80),
      email: z.string().email().max(120),
      source: z.string().max(180).default(""),
      honey: z.string().max(80).default(""),
      asset: z.string().max(80).default("forex-starter"),
    }),
  )
  .handler(async ({ data }) => {
    if (isHoneypot(data.honey)) return { ok: true as const };
    const name = cleanLine(data.name, 80);
    const email = cleanLine(data.email, 120).toLowerCase();
    const source = cleanLine(data.source, 180);
    const asset = cleanLine(data.asset, 80) || "forex-starter";
    if (!isSafeName(name) || looksLikeInjection(source)) {
      throw new Error("This field contains characters that are not allowed.");
    }
    assertRateLimit("download", 12);
    const sql = await getSql();
    await sql`
      insert into downloads (asset, name, email, source)
      values (${asset}, ${name}, ${email}, ${source})`;
    return { ok: true as const };
  });

export const listDownloadStats = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async (): Promise<DownloadStats> => {
    const sql = await getSql();
    const totals = await sql<{ total: number; unique_emails: number; last_7_days: number }>`
      select
        count(*)::int as total,
        count(distinct email)::int as unique_emails,
        count(*) filter (where created_at >= now() - interval '7 days')::int as last_7_days
      from downloads`;
    const rows = await sql<DownloadRow>`
      select id, asset, name, email, source, created_at from downloads order by created_at desc limit 200`;
    return {
      total: totals[0]?.total ?? 0,
      unique_emails: totals[0]?.unique_emails ?? 0,
      last_7_days: totals[0]?.last_7_days ?? 0,
      rows,
    };
  });
