import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { confirmPayment, listPayments, payMethodLabel } from "@/lib/payments";
import { safeLoad } from "@/lib/admin-load";

export const Route = createFileRoute("/admin/payments")({
  loader: () => safeLoad(() => listPayments(), []),
  component: PaymentsAdmin,
});

function PaymentsAdmin() {
  const payments = Route.useLoaderData();
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Payments</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Students pay by bank (USD or UGX) or Uganda mobile money, then tap “I have sent the payment”. Mark paid when the money is on the account. Bank numbers live under{" "}
          <Link to="/admin/settings" className="underline">
            Settings
          </Link>
          .
        </p>
      </div>
      {payments.length === 0 ? <p className="text-sm text-muted">No payments yet.</p> : null}
      <ul className="space-y-3">
        {payments.map((p) => (
          <li key={p.id} className="rounded-xl border border-line bg-paper p-4 text-sm">
            <p className="font-medium">
              {p.name} · {p.email}
            </p>
            <p className="text-muted">
              {p.program} · ${p.amount_usd} · UGX {p.amount_ugx.toLocaleString()} · {payMethodLabel(p.method)} · {p.status}
            </p>
            <p className="font-mono text-xs text-muted">{p.tx_ref}</p>
            {p.status !== "paid" ? (
              <button
                type="button"
                className="mt-3 rounded-md bg-ink px-3 py-1.5 text-xs text-paper"
                onClick={async () => {
                  if (!confirm(`Mark ${p.tx_ref} as paid?`)) return;
                  await confirmPayment({ data: { tx_ref: p.tx_ref } });
                  await router.invalidate();
                }}
              >
                Mark paid
              </button>
            ) : (
              <p className="mt-2 text-xs">Paid</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
