import { createFileRoute, useRouter } from "@tanstack/react-router";
import { listInquiries, updateInquiryStatus } from "@/lib/cms";
import { safeLoad } from "@/lib/admin-load";

export const Route = createFileRoute("/admin/inquiries")({
  loader: () => safeLoad(() => listInquiries(), []),
  component: Inquiries,
});

function Inquiries() {
  const rows = Route.useLoaderData();
  const router = useRouter();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Inquiries</h1>
      {rows.length === 0 ? <p className="mt-6 text-sm text-muted">None yet.</p> : null}
      <ul className="mt-6 space-y-4">
        {rows.map((r) => (
          <li key={r.id} className="rounded-xl border border-line bg-paper p-5">
            <p className="font-medium">
              {r.name} · {r.email}
            </p>
            <p className="text-sm text-muted">
              {r.kind} · {r.topic} · {r.status} · {r.phone}
            </p>
            <p className="mt-2 text-sm">{r.message}</p>
            <div className="mt-3 flex gap-2 text-sm">
              {(["new", "open", "done"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  className="rounded-md border border-line px-2 py-1"
                  onClick={async () => {
                    await updateInquiryStatus({ data: { id: r.id, status: s } });
                    await router.invalidate();
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
