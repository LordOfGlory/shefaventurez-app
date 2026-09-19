import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminField, StatusBadge, af } from "@/components/admin-form";
import { deleteService, listAllServices, upsertService, type ServiceRow } from "@/lib/cms";
import { safeLoad } from "@/lib/admin-load";
import { slugify } from "@/lib/security";

export const Route = createFileRoute("/admin/services")({
  loader: () => safeLoad(() => listAllServices(), []),
  component: ServicesAdmin,
});

const blank = (): ServiceRow => ({
  id: 0,
  slug: "",
  kind: "it",
  title: "",
  summary: "",
  body: "",
  status: "published",
  sort_order: 0,
});

function ServicesAdmin() {
  const rows = Route.useLoaderData();
  const router = useRouter();
  const [selected, setSelected] = useState(rows[0]?.slug ?? "");
  const [creating, setCreating] = useState(false);
  const current = useMemo(() => rows.find((r) => r.slug === selected) ?? null, [rows, selected]);

  return (
    <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Services</h1>
          <button type="button" className="text-sm text-blue" onClick={() => setCreating(true)}>
            New
          </button>
        </div>
        <p className="mt-2 text-sm text-muted">IT and cybersecurity offerings. These appear on the public service pages.</p>
        <ul className="mt-6 space-y-1">
          {rows.map((s) => (
            <li key={s.slug}>
              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  setSelected(s.slug);
                }}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                  !creating && selected === s.slug ? "bg-ink text-paper" : "hover:bg-paper"
                }`}
              >
                <span className="truncate pr-2">
                  {s.title}
                  <span className="ml-2 text-xs opacity-70">{s.kind}</span>
                </span>
                <StatusBadge status={s.status} />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <ServiceForm
        key={creating ? "new" : current?.slug || "empty"}
        service={creating ? blank() : current}
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

function ServiceForm({
  service,
  creating,
  onSaved,
  onDeleted,
}: {
  service: ServiceRow | null;
  creating: boolean;
  onSaved: (slug: string) => Promise<void>;
  onDeleted: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  if (!service) return <p className="text-sm text-muted">Select a service.</p>;
  const s = service;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") || "").trim();
    const slug = creating ? slugify(String(fd.get("slug") || title)) : s.slug;
    try {
      await upsertService({
        data: {
          slug,
          kind: String(fd.get("kind") || "it") === "cyber" ? "cyber" : "it",
          title,
          summary: String(fd.get("summary") || ""),
          body: String(fd.get("body") || ""),
          status: String(fd.get("status") || "published") === "draft" ? "draft" : "published",
          sort_order: Number(fd.get("sort_order") || 0),
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
      <h2 className="font-semibold">{creating ? "New service" : s.title}</h2>
      {creating ? (
        <AdminField label="Slug">
          <input name="slug" className={af} required pattern="[a-z0-9-]+" />
        </AdminField>
      ) : null}
      <AdminField label="Title">
        <input name="title" className={af} required defaultValue={s.title} />
      </AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Kind">
          <select name="kind" className={af} defaultValue={s.kind}>
            <option value="it">IT</option>
            <option value="cyber">Cybersecurity</option>
          </select>
        </AdminField>
        <AdminField label="Sort order">
          <input name="sort_order" type="number" min={0} className={af} defaultValue={s.sort_order} />
        </AdminField>
      </div>
      <AdminField label="Summary">
        <textarea name="summary" rows={3} className={af} defaultValue={s.summary} />
      </AdminField>
      <AdminField label="Body">
        <textarea name="body" rows={6} className={af} defaultValue={s.body} />
      </AdminField>
      <AdminField label="Status">
        <select name="status" className={af} defaultValue={s.status}>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </AdminField>
      {msg ? <p className="text-sm">{msg}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button disabled={busy} className="rounded-md bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50" type="submit">
          {busy ? "Saving…" : "Save"}
        </button>
        {!creating && s.slug ? (
          <button
            type="button"
            className="text-sm text-red-700"
            onClick={async () => {
              if (!confirm(`Delete ${s.title}?`)) return;
              await deleteService({ data: { slug: s.slug } });
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
