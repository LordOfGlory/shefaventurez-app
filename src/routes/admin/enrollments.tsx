import { createFileRoute, useRouter } from "@tanstack/react-router";
import { deleteEnrollment, listEnrollments, updateEnrollmentStatus } from "@/lib/cms";
import { confirmPayment } from "@/lib/payments";
import { safeLoad } from "@/lib/admin-load";

export const Route = createFileRoute("/admin/enrollments")({
  loader: () => safeLoad(() => listEnrollments(), []),
  component: EnrollmentsAdmin,
});

function EnrollmentsAdmin() {
  const rows = Route.useLoaderData();
  const router = useRouter();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Enrollments</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        New students pay on the site (bank transfer USD / UGX or Uganda mobile money). Mark paid when you see the transfer.
      </p>
      {rows.length === 0 ? <p className="mt-6 text-sm text-muted">No requests yet.</p> : null}
      <ul className="mt-6 space-y-4">
        {rows.map((r) => (
          <li key={r.id} className="rounded-xl border border-line bg-paper p-5">
            <p className="font-medium">
              {r.name} · {r.email}
            </p>
            <p className="text-sm text-muted">
              {r.program} · {r.status} · {r.country || "—"} · {r.pay_method || "—"} · {r.phone}
            </p>
            {r.tx_ref ? <p className="mt-1 font-mono text-xs">{r.tx_ref}</p> : null}
            {r.notes ? <p className="mt-2 text-sm">{r.notes}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {r.tx_ref && r.status !== "confirmed" ? (
                <button
                  type="button"
                  className="rounded-md bg-ink px-3 py-1.5 text-paper"
                  onClick={async () => {
                    if (!confirm("Mark this enrollment as paid?")) return;
                    await confirmPayment({ data: { tx_ref: r.tx_ref as string } });
                    await router.invalidate();
                  }}
                >
                  Mark paid
                </button>
              ) : null}
              {(["pending_payment", "awaiting_confirm", "confirmed", "closed"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  className="rounded-md border border-line px-2 py-1"
                  onClick={async () => {
                    await updateEnrollmentStatus({ data: { id: r.id, status: s } });
                    await router.invalidate();
                  }}
                >
                  {s.replaceAll("_", " ")}
                </button>
              ))}
              <button
                type="button"
                className="text-red-700"
                onClick={async () => {
                  if (!confirm("Delete this enrollment?")) return;
                  await deleteEnrollment({ data: { id: r.id } });
                  await router.invalidate();
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
