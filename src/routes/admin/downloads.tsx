import { createFileRoute } from "@tanstack/react-router";
import { listDownloadStats } from "@/lib/cms";
import { safeLoad } from "@/lib/admin-load";

const EMPTY = { total: 0, unique_emails: 0, last_7_days: 0, rows: [] as never[] };

export const Route = createFileRoute("/admin/downloads")({
  loader: () => safeLoad(() => listDownloadStats(), EMPTY),
  component: Downloads,
});

function Downloads() {
  const data = Route.useLoaderData();

  function csv() {
    const header = "time,name,email,source,asset";
    const lines = data.rows.map((r) =>
      [r.created_at, r.name, r.email, r.source, r.asset].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shefa-pdf-downloads.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">PDF downloads</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        People who completed the form on this site. Direct file links no longer count.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Downloads" value={data.total} />
        <Stat label="Unique emails" value={data.unique_emails} />
        <Stat label="Last 7 days" value={data.last_7_days} />
      </div>
      {data.rows.length ? (
        <button type="button" onClick={csv} className="mt-6 h-11 rounded-md border border-line px-4 text-sm">
          Export CSV
        </button>
      ) : null}
      {data.rows.length === 0 ? (
        <p className="mt-8 text-sm text-muted">None yet on this site. Use Get the PDF on the public download page to test.</p>
      ) : null}
      <ul className="mt-6 divide-y divide-line overflow-hidden rounded-xl border border-line bg-paper">
        {data.rows.map((r) => (
          <li key={r.id} className="grid gap-1 px-5 py-4 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="font-medium">
                {r.name} · {r.email}
              </p>
              <p className="text-sm text-muted">
                {r.asset} · {r.source || "direct"}
              </p>
            </div>
            <p className="text-sm tabular-nums text-muted">{new Date(r.created_at).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-paper p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
