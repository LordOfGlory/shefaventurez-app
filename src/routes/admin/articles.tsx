import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminField, StatusBadge, af } from "@/components/admin-form";
import { deleteArticle, listAllArticles, upsertArticle, type ArticleRow } from "@/lib/cms";
import { safeLoad } from "@/lib/admin-load";
import { slugify } from "@/lib/security";

export const Route = createFileRoute("/admin/articles")({
  loader: () => safeLoad(() => listAllArticles(), []),
  component: ArticlesAdmin,
});

const blank = (): ArticleRow => ({
  id: 0,
  slug: "",
  title: "",
  category: "",
  excerpt: "",
  body: "",
  minutes: 8,
  status: "published",
});

function ArticlesAdmin() {
  const rows = Route.useLoaderData();
  const router = useRouter();
  const [selected, setSelected] = useState(rows[0]?.slug ?? "");
  const [creating, setCreating] = useState(false);
  const current = useMemo(() => rows.find((r) => r.slug === selected) ?? null, [rows, selected]);

  return (
    <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Articles</h1>
          <button type="button" className="text-sm text-blue" onClick={() => setCreating(true)}>
            New
          </button>
        </div>
        <p className="mt-2 text-sm text-muted">Resources on the public site. Blank line between paragraphs. No HTML.</p>
        <ul className="mt-6 space-y-1">
          {rows.map((a) => (
            <li key={a.slug}>
              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  setSelected(a.slug);
                }}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                  !creating && selected === a.slug ? "bg-ink text-paper" : "hover:bg-paper"
                }`}
              >
                <span className="truncate pr-2">{a.title}</span>
                <StatusBadge status={a.status} />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <ArticleForm
        key={creating ? "new" : current?.slug || "empty"}
        article={creating ? blank() : current}
        creating={creating}
        onSaved={async (slug) => {
          setCreating(false);
          setSelected(slug);
          await router.invalidate();
        }}
        onDeleted={async () => {
          setSelected(rows[0]?.slug ?? "");
          await router.invalidate();
        }}
      />
    </div>
  );
}

function ArticleForm({
  article,
  creating,
  onSaved,
  onDeleted,
}: {
  article: ArticleRow | null;
  creating: boolean;
  onSaved: (slug: string) => Promise<void>;
  onDeleted: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  if (!article) return <p className="text-sm text-muted">Select or create an article.</p>;
  const a = article;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") || "").trim();
    const slug = creating ? slugify(String(fd.get("slug") || title)) : a.slug;
    try {
      await upsertArticle({
        data: {
          slug,
          title,
          category: String(fd.get("category") || ""),
          excerpt: String(fd.get("excerpt") || ""),
          body: String(fd.get("body") || ""),
          minutes: Number(fd.get("minutes") || 8),
          status: String(fd.get("status") || "published") === "draft" ? "draft" : "published",
        },
      });
      setMsg("Saved.");
      await onSaved(slug);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-4 rounded-xl border border-line bg-paper p-5" onSubmit={submit}>
      <h2 className="font-semibold">{creating ? "New article" : a.title}</h2>
      {creating ? (
        <AdminField label="Slug">
          <input name="slug" className={af} pattern="[a-z0-9-]+" placeholder="generated-from-title" />
        </AdminField>
      ) : null}
      <AdminField label="Title">
        <input name="title" className={af} required defaultValue={a.title} />
      </AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Category">
          <input name="category" className={af} defaultValue={a.category} />
        </AdminField>
        <AdminField label="Minutes">
          <input name="minutes" type="number" min={1} max={120} className={af} defaultValue={a.minutes} />
        </AdminField>
      </div>
      <AdminField label="Excerpt">
        <textarea name="excerpt" rows={3} className={af} defaultValue={a.excerpt} />
      </AdminField>
      <AdminField label="Body">
        <textarea name="body" rows={12} className={af} defaultValue={a.body} />
      </AdminField>
      <AdminField label="Status">
        <select name="status" className={af} defaultValue={a.status}>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </AdminField>
      {msg ? <p className="text-sm">{msg}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button disabled={busy} className="rounded-md bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50" type="submit">
          {busy ? "Saving…" : "Save"}
        </button>
        {!creating && a.slug ? (
          <button
            type="button"
            className="text-sm text-red-700"
            onClick={async () => {
              if (!confirm(`Delete ${a.title}?`)) return;
              await deleteArticle({ data: { slug: a.slug } });
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
