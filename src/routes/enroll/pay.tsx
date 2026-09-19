import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { PublicShell } from "@/components/site-chrome";
import { CONTACT_EMAIL, PAY_BANK_UGX, PAY_BANK_USD, PAY_MOMO, WHATSAPP_DISPLAY, enrollWhatsapp, whatsappHref } from "@/lib/content";
import { getOrder, markPaidNotice, type PayMethod } from "@/lib/payments";
import { TX_REF_RE } from "@/lib/security";
import { safeLoad } from "@/lib/admin-load";

type Search = { tx_ref?: string };

export const Route = createFileRoute("/enroll/pay")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    tx_ref: typeof s.tx_ref === "string" ? s.tx_ref : "",
  }),
  loaderDeps: ({ search }) => ({ tx_ref: search.tx_ref || "" }),
  loader: async ({ deps }) => {
    if (!deps.tx_ref || !TX_REF_RE.test(deps.tx_ref)) return null;
    return safeLoad(() => getOrder({ data: { tx_ref: deps.tx_ref } }), null);
  },
  component: Pay,
  head: () => ({ meta: [{ title: "Pay | Shefa Venturez" }] }),
});

function Copy({ value }: { value: string }) {
  const [ok, setOk] = useState(false);
  if (!value) return null;
  return (
    <button
      type="button"
      className="ml-2 text-xs font-medium text-blue"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setOk(true);
          setTimeout(() => setOk(false), 1400);
        } catch {
          /* ignore */
        }
      }}
    >
      {ok ? "Copied" : "Copy"}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <p className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium">
        {value}
        <Copy value={value} />
      </span>
    </p>
  );
}

function Pay() {
  const { tx_ref } = Route.useSearch();
  const order = Route.useLoaderData();
  const [method, setMethod] = useState<PayMethod>("bank_usd");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  if (!tx_ref) return <Navigate to="/enroll" />;
  if (!order || order.status === "missing") {
    return (
      <PublicShell>
        <section className="mx-auto max-w-xl px-5 py-20">
          <h1 className="text-2xl font-semibold">Payment not found</h1>
          <p className="mt-3 text-sm text-muted">Start again from enroll, or message WhatsApp {WHATSAPP_DISPLAY}.</p>
          <Link to="/enroll" className="mt-6 inline-flex h-11 items-center rounded-md bg-ink px-4 text-sm text-paper">
            Back to enroll
          </Link>
        </section>
      </PublicShell>
    );
  }
  if (order.status === "paid") return <Navigate to="/enroll/paid" search={{ tx_ref: order.tx_ref }} />;
  if (order.status === "awaiting_confirm") return <Navigate to="/enroll/paid" search={{ tx_ref: order.tx_ref }} />;

  const wa = whatsappHref(
    `Hello Shefa Venturez — I enrolled in ${order.programName}. Reference ${order.tx_ref}. Please send bank / mobile-money details if they are not on the pay page.`,
  );

  return (
    <PublicShell>
      <section className="mx-auto max-w-2xl px-5 py-16">
        <p className="text-xs uppercase tracking-wider text-muted">Checkout</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Pay for {order.programName}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {order.name} · {order.email}. New students enroll every month. Use the reference below as the transfer narration so we can match it.
        </p>
        <div className="mt-6 rounded-xl border border-line bg-fog p-5">
          <p className="text-sm text-muted">Amount</p>
          <p className="mt-1 text-2xl font-semibold">${order.amount_usd}</p>
          <p className="text-sm text-muted">≈ UGX {order.amount_ugx.toLocaleString()}</p>
          <p className="mt-3 font-mono text-sm">
            {order.tx_ref}
            <Copy value={order.tx_ref} />
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          <Rail
            title={PAY_BANK_USD}
            hint="Worldwide"
            selected={method === "bank_usd"}
            onSelect={() => setMethod("bank_usd")}
          >
            <Row label="Bank" value={order.bank_name} />
            <Row label="Account name" value={order.bank_account_name} />
            {order.bank_usd_account ? (
              <Row label="USD account" value={order.bank_usd_account} />
            ) : (
              <p className="text-sm text-muted">USD account number is sent on WhatsApp if it is not stored yet.</p>
            )}
            <Row label="Branch" value={order.bank_branch} />
            <Row label="SWIFT" value={order.bank_swift} />
            <Row label="Amount" value={`$${order.amount_usd}`} />
          </Rail>
          <Rail
            title={PAY_BANK_UGX}
            hint="Uganda"
            selected={method === "bank_ugx"}
            onSelect={() => setMethod("bank_ugx")}
          >
            <Row label="Bank" value={order.bank_name} />
            <Row label="Account name" value={order.bank_account_name} />
            {order.bank_ugx_account ? (
              <Row label="UGX account" value={order.bank_ugx_account} />
            ) : (
              <p className="text-sm text-muted">UGX account number is sent on WhatsApp if it is not stored yet.</p>
            )}
            <Row label="Amount" value={`UGX ${order.amount_ugx.toLocaleString()}`} />
          </Rail>
          <Rail
            title={PAY_MOMO}
            hint="MTN / Airtel · Uganda"
            selected={method === "momo"}
            onSelect={() => setMethod("momo")}
          >
            <Row label="Name" value={order.momo_name || "Shefa Venturez"} />
            <Row label="Number" value={order.momo_number || WHATSAPP_DISPLAY} />
            <p className="text-sm text-muted">Same number as WhatsApp {WHATSAPP_DISPLAY}.</p>
            <Row label="Amount" value={`UGX ${order.amount_ugx.toLocaleString()}`} />
          </Rail>
        </div>

        {!(order.bank_usd_account || order.bank_ugx_account || order.momo_number) ? (
          <p className="mt-6 text-sm leading-relaxed text-muted">
            Account numbers are not stored on this site yet. Message WhatsApp {WHATSAPP_DISPLAY} or {CONTACT_EMAIL} with your reference {order.tx_ref}.
          </p>
        ) : null}

        {msg ? <p className="mt-4 text-sm text-red-700">{msg}</p> : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            className="h-11 rounded-md bg-ink px-4 text-sm font-medium text-paper disabled:opacity-50"
            onClick={async () => {
              setBusy(true);
              setMsg("");
              try {
                await markPaidNotice({ data: { tx_ref: order.tx_ref, method } });
                window.location.href = `/enroll/paid?tx_ref=${encodeURIComponent(order.tx_ref)}`;
              } catch (err) {
                setMsg(err instanceof Error ? err.message : "Could not record the notice.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Saving…" : "I have sent the payment"}
          </button>
          <a href={wa} className="inline-flex h-11 items-center rounded-md bg-wa px-4 text-sm font-medium text-paper">
            WhatsApp {WHATSAPP_DISPLAY}
          </a>
          <a href={enrollWhatsapp(order.programName)} className="inline-flex h-11 items-center rounded-md border border-line px-4 text-sm">
            Ask a question
          </a>
        </div>
      </section>
    </PublicShell>
  );
}

function Rail({
  title,
  hint,
  selected,
  onSelect,
  children,
}: {
  title: string;
  hint: string;
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`rounded-2xl border p-6 text-left transition ${selected ? "border-ink bg-paper shadow-sm" : "border-line bg-paper hover:border-ink/40"}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="flex items-center gap-2 font-semibold">
          <span className={`grid h-4 w-4 place-items-center rounded-full border ${selected ? "border-ink bg-ink" : "border-line"}`}>
            {selected ? <span className="h-1.5 w-1.5 rounded-full bg-paper" /> : null}
          </span>
          {title}
        </p>
        <p className="text-xs text-muted">{hint}</p>
      </div>
      <div className="mt-4 space-y-2">{children}</div>
    </div>
  );
}
