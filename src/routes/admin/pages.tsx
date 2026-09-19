import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminField, StatusBadge, af } from "@/components/admin-form";
import { deletePage, listAllPages, upsertPage, type PageRow } from "@/lib/cms";
import { safeLoad } from "@/lib/admin-load";
import { CORE_PAGE_SLUGS, isCorePage, publicPathForPage, emptyPage } from "@/lib/page-defaults";
import { slugify } from "@/lib/security";

export const Route = createFileRoute("/admin/pages")({
  loader: () => safeLoad(() => listAllPages(), []),
  component: PagesAdmin,
});

function PagesAdmin() {
  const rows = Route.useLoaderData();
  const router = useRouter();
  const [selected, setSelected] = useState<string>(rows[0]?.slug ?? "home");
  const [creating, setCreating] = useState(false);
  const current = useMemo(() => rows.find((r) => r.slug === selected) ?? null, [rows, selected]);

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      <div>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Pages</h1>
          <button
            type="button"
            className="text-sm text-blue"
            onClick={() => {
              setCreating(true);
              setSelected("");
            }}
          >
            New
          </button>
        </div>
        <p className="mt-2 text-sm text-muted">Headings and body copy on the public site. Core pages cannot be deleted.</p>
        <ul className="mt-6 space-y-1">
          {rows.map((p) => (
            <li key={p.slug}>
              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  setSelected(p.slug);
                }}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                  !creating && selected === p.slug ? "bg-ink text-paper" : "hover:bg-paper"
                }`}
              >
                <span>{p.slug}</span>
                <StatusBadge status={p.status} />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <PageForm
        key={creating ? "new" : current?.slug || "empty"}
        page={creating ? emptyPage("") : current}
        creating={creating}
        onSaved={async (slug) => {
          setCreating(false);
          setSelected(slug);
          await router.invalidate();
        }}
        onDeleted={async () => {
          setSelected(CORE_PAGE_SLUGS[0]);
          await router.invalidate();
        }}
      />
    </div>
  );
}

function PageForm({
  page,
  creating,
  onSaved,
  onDeleted,
}: {
  page: PageRow | null;
  creating: boolean;
  onSaved: (slug: string) => Promise<void>;
  onDeleted: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  if (!page && !creating) {
    return <p className="text-sm text-muted">Select a page.</p>;
  }
  const p = page ?? emptyPage("");
  const locked = !creating && isCorePage(p.slug);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") || "").trim();
    const slug = (creating ? slugify(String(fd.get("slug") || title)) : p.slug) || p.slug;
    try {
      await upsertPage({
        data: {
          slug,
          title,
          eyebrow: String(fd.get("eyebrow") || ""),
          heading: String(fd.get("heading") || ""),
          lede: String(fd.get("lede") || ""),
          body: String(fd.get("body") || ""),
          cta_label: String(fd.get("cta_label") || ""),
          cta_href: String(fd.get("cta_href") || ""),
          hero_image: String(fd.get("hero_image") || ""),
          status: String(fd.get("status") || "published") === "draft" ? "draft" : "published",
        },
      });
      setMsg("Saved. The live page updates immediately.");
      await onSaved(slug);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-4 rounded-xl border border-line bg-paper p-5" onSubmit={submit}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">{creating ? "New page" : p.slug}</h2>
        {!creating ? (
          <a href={publicPathForPage(p.slug)} className="text-sm text-blue" target="_blank" rel="noreferrer">
            View
          </a>
        ) : null}
      </div>
      {creating ? (
        <AdminField label="Slug" hint="Lowercase letters, numbers, hyphens. Becomes /pages/your-slug unless it is a core page.">
          <input name="slug" className={af} required pattern="[a-z0-9-]+" placeholder="pricing-note" />
        </AdminField>
      ) : (
        <input type="hidden" name="slug" value={p.slug} />
      )}
      <AdminField label="Browser title">
        <input name="title" className={af} required defaultValue={p.title} />
      </AdminField>
      <AdminField label="Eyebrow">
        <input name="eyebrow" className={af} defaultValue={p.eyebrow} />
      </AdminField>
      <AdminField label="Heading">
        <input name="heading" className={af} defaultValue={p.heading} />
      </AdminField>
      <AdminField label="Lede">
        <textarea name="lede" rows={3} className={af} defaultValue={p.lede} />
      </AdminField>
      <AdminField label="Body" hint="Blank line between paragraphs. Do not paste HTML.">
        <textarea name="body" rows={10} className={af} defaultValue={p.body} />
      </AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Button label">
          <input name="cta_label" className={af} defaultValue={p.cta_label} />
        </AdminField>
        <AdminField label="Button link" hint="Site path like /consultation or an https URL.">
          <input name="cta_href" className={af} defaultValue={p.cta_href} />
        </AdminField>
      </div>
      <AdminField label="Hero image" hint="Site path such as /img/meeting.jpg">
        <input name="hero_image" className={af} defaultValue={p.hero_image} />
      </AdminField>
      <AdminField label="Status">
        <select name="status" className={af} defaultValue={p.status || "published"}>
          <option value="published">Published</option>
          <option value="draft">Draft (core pages show the default copy)</option>
        </select>
      </AdminField>
      {msg ? <p className="text-sm">{msg}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button disabled={busy} className="rounded-md bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50" type="submit">
          {busy ? "Saving…" : "Save"}
        </button>
        {!creating && !locked ? (
          <button
            type="button"
            className="text-sm text-red-700"
            onClick={async () => {
              if (!confirm(`Delete ${p.slug}?`)) return;
              await deletePage({ data: { slug: p.slug } });
              await onDeleted();
            }}
          >
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}
