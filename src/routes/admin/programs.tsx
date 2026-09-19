import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminField, StatusBadge, af } from "@/components/admin-form";
import { deleteProgram, listAllPrograms, upsertProgram, type ProgramRow } from "@/lib/cms";
import { safeLoad } from "@/lib/admin-load";
import { isCoreProgram } from "@/lib/page-defaults";
import { slugify } from "@/lib/security";

export const Route = createFileRoute("/admin/programs")({
  loader: () => safeLoad(() => listAllPrograms(), []),
  component: ProgramsAdmin,
});

const blank = (): ProgramRow => ({
  id: 0,
  slug: "",
  name: "",
  price_label: "",
  duration: "",
  summary: "",
  body: "",
  status: "published",
  sort_order: 0,
  amount_usd: 0,
  amount_ugx: 0,
});

function ProgramsAdmin() {
  const rows = Route.useLoaderData();
  const router = useRouter();
  const [selected, setSelected] = useState(rows[0]?.slug ?? "it");
  const [creating, setCreating] = useState(false);
  const current = useMemo(() => rows.find((r) => r.slug === selected) ?? null, [rows, selected]);

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Programs</h1>
          <button type="button" className="text-sm text-blue" onClick={() => setCreating(true)}>
            New
          </button>
        </div>
        <p className="mt-2 text-sm text-muted">Tuition and copy for each academy. IT, Cyber and Forex cannot be deleted.</p>
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
                <span>{p.name}</span>
                <StatusBadge status={p.status} />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <ProgramForm
        key={creating ? "new" : current?.slug || "empty"}
        program={creating ? blank() : current}
        creating={creating}
        onSaved={async (slug) => {
          setCreating(false);
          setSelected(slug);
          await router.invalidate();
        }}
        onDeleted={async () => {
          setSelected(rows[0]?.slug ?? "it");
          await router.invalidate();
        }}
      />
    </div>
  );
}

function ProgramForm({
  program,
  creating,
  onSaved,
  onDeleted,
}: {
  program: ProgramRow | null;
  creating: boolean;
  onSaved: (slug: string) => Promise<void>;
  onDeleted: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  if (!program) return <p className="text-sm text-muted">Select a program.</p>;
  const p = program;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const slug = creating ? slugify(String(fd.get("slug") || name)) : p.slug;
    try {
      await upsertProgram({
        data: {
          slug,
          name,
          price_label: String(fd.get("price_label") || ""),
          duration: String(fd.get("duration") || ""),
          summary: String(fd.get("summary") || ""),
          body: String(fd.get("body") || ""),
          status: String(fd.get("status") || "published") === "draft" ? "draft" : "published",
          sort_order: Number(fd.get("sort_order") || 0),
          amount_usd: Number(fd.get("amount_usd") || 0),
          amount_ugx: Number(fd.get("amount_ugx") || 0),
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
      <h2 className="font-semibold">{creating ? "New program" : p.name}</h2>
      {creating ? (
        <AdminField label="Slug">
          <input name="slug" className={af} required pattern="[a-z0-9-]+" placeholder="advanced-it" />
        </AdminField>
      ) : null}
      <AdminField label="Name">
        <input name="name" className={af} required defaultValue={p.name} />
      </AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="USD">
          <input name="amount_usd" type="number" min={0} className={af} defaultValue={p.amount_usd} />
        </AdminField>
        <AdminField label="UGX equivalent">
          <input name="amount_ugx" type="number" min={0} className={af} defaultValue={p.amount_ugx} />
        </AdminField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Price label" hint="Leave blank to generate from the amounts.">
          <input name="price_label" className={af} defaultValue={p.price_label} />
        </AdminField>
        <AdminField label="Duration">
          <input name="duration" className={af} defaultValue={p.duration} />
        </AdminField>
      </div>
      <AdminField label="Summary">
        <textarea name="summary" rows={3} className={af} defaultValue={p.summary} />
      </AdminField>
      <AdminField label="Body" hint="Shown on the academy page. Blank line between paragraphs.">
        <textarea name="body" rows={6} className={af} defaultValue={p.body} />
      </AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Sort order">
          <input name="sort_order" type="number" min={0} className={af} defaultValue={p.sort_order} />
        </AdminField>
        <AdminField label="Status">
          <select name="status" className={af} defaultValue={p.status}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </AdminField>
      </div>
      {msg ? <p className="text-sm">{msg}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button disabled={busy} className="rounded-md bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50" type="submit">
          {busy ? "Saving…" : "Save"}
        </button>
        {!creating && !isCoreProgram(p.slug) ? (
          <button
            type="button"
            className="text-sm text-red-700"
            onClick={async () => {
              if (!confirm(`Delete ${p.name}?`)) return;
              await deleteProgram({ data: { slug: p.slug } });
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
