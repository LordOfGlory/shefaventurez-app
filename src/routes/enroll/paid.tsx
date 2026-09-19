import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { PublicShell } from "@/components/site-chrome";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY, whatsappHref } from "@/lib/content";
import { getOrder } from "@/lib/payments";
import { TX_REF_RE } from "@/lib/security";
import { safeLoad } from "@/lib/admin-load";

type Search = { tx_ref?: string };

export const Route = createFileRoute("/enroll/paid")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    tx_ref: typeof s.tx_ref === "string" ? s.tx_ref : "",
  }),
  loaderDeps: ({ search }) => ({ tx_ref: search.tx_ref || "" }),
  loader: async ({ deps }) => {
    if (!deps.tx_ref || !TX_REF_RE.test(deps.tx_ref)) return null;
    return safeLoad(() => getOrder({ data: { tx_ref: deps.tx_ref } }), null);
  },
  component: Paid,
  head: () => ({ meta: [{ title: "Payment received | Shefa Venturez" }] }),
});

function Paid() {
  const { tx_ref } = Route.useSearch();
  const order = Route.useLoaderData();
  if (!tx_ref) return <Navigate to="/enroll" />;
  if (!order || order.status === "missing") return <Navigate to="/enroll" />;

  const paid = order.status === "paid";
  const wa = whatsappHref(
    `Hello Shefa Venturez — I sent payment for ${order.programName}. Reference ${order.tx_ref}. Please confirm.`,
  );

  return (
    <PublicShell>
      <section className="mx-auto max-w-xl px-5 py-20">
        <p className="text-xs uppercase tracking-wider text-muted">{paid ? "Confirmed" : "Awaiting confirmation"}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {paid ? "Your place is confirmed." : "We will confirm when the payment lands."}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          {order.programName} · {order.name}. Reference <span className="font-mono text-ink">{order.tx_ref}</span>.
        </p>
        {paid && order.invite ? (
          <a href={order.invite} className="mt-8 inline-flex h-11 items-center rounded-md bg-wa px-4 text-sm font-medium text-paper">
            Join the VIP WhatsApp group
          </a>
        ) : (
          <p className="mt-6 text-sm leading-relaxed text-muted">
            Staff mark the payment paid in the dashboard. We reply on WhatsApp {WHATSAPP_DISPLAY} or {CONTACT_EMAIL}.
          </p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={wa} className="inline-flex h-11 items-center rounded-md bg-wa px-4 text-sm font-medium text-paper">
            WhatsApp {WHATSAPP_DISPLAY}
          </a>
          <Link to="/" className="inline-flex h-11 items-center rounded-md border border-line px-4 text-sm">
            Home
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
