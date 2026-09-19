import { useState } from "react";
import { createInquiry } from "@/lib/cms";
import { startCheckout } from "@/lib/payments";
import { CONTACT_EMAIL, SCHOOLS, WHATSAPP_DISPLAY, WHATSAPP_HREF, enrollWhatsapp } from "@/lib/content";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}

const input =
  "w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-base outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/20";

export function InquiryForm({ kind }: { kind: "contact" | "consultation" }) {
  const [status, setStatus] = useState<"idle" | "busy" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("busy");
    setMessage("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      kind,
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      topic: String(fd.get("topic") || fd.get("service") || "").trim(),
      message: String(fd.get("message") || fd.get("description") || "").trim(),
      honey: String(fd.get("company_site") || ""),
    };
    try {
      await createInquiry({ data: payload });
    } catch {
      /* still try email */
    }
    try {
      const res = await fetch("https://formsubmit.co/ajax/" + CONTACT_EMAIL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          kind: payload.kind,
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          topic: payload.topic,
          message: payload.message,
          company: String(fd.get("company") || ""),
          _subject: kind === "consultation" ? "Shefa Venturez consultation request" : "Shefa Venturez contact",
          _template: "table",
          _captcha: "false",
          _replyto: payload.email,
        }),
      });
      await res.json().catch(() => ({}));
    } catch {
      const body = Object.entries(payload)
        .filter(([k]) => k !== "honey")
        .map(([k, v]) => k + ": " + v)
        .join("\n");
      window.location.href =
        "mailto:" +
        CONTACT_EMAIL +
        "?subject=" +
        encodeURIComponent("Shefa Venturez " + kind) +
        "&body=" +
        encodeURIComponent(body);
    }
    setStatus("ok");
    form.reset();
  }

  if (status === "ok") {
    return (
      <div className="rounded-xl border border-line bg-fog p-6">
        <p className="font-medium">Request received.</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          We reply from {CONTACT_EMAIL}. For a faster reply, use WhatsApp {WHATSAPP_DISPLAY}.
        </p>
        <a href={WHATSAPP_HREF} className="mt-5 inline-flex h-11 items-center rounded-md bg-wa px-4 text-sm font-medium text-paper">
          Message {WHATSAPP_DISPLAY}
        </a>
      </div>
    );
  }

  return (
    <form className="relative grid gap-4" onSubmit={onSubmit} noValidate>
      <Field label="Name">
        <input required name="name" className={input} autoComplete="name" minLength={2} maxLength={80} />
      </Field>
      {kind === "consultation" ? (
        <Field label="Company (optional)">
          <input name="company" className={input} autoComplete="organization" />
        </Field>
      ) : null}
      <Field label="Email">
        <input required type="email" name="email" className={input} autoComplete="email" />
      </Field>
      <Field label="Phone (optional)">
        <input name="phone" className={input} autoComplete="tel" />
      </Field>
      <Field label={kind === "consultation" ? "Service" : "Topic"}>
        <select name={kind === "consultation" ? "service" : "topic"} className={input} defaultValue="" required>
          <option value="" disabled>
            Select
          </option>
          <option>IT services</option>
          <option>Cybersecurity</option>
          <option>Academy</option>
          <option>Partnership</option>
          <option>Other</option>
        </select>
      </Field>
      <Field label={kind === "consultation" ? "Project description" : "Message"}>
        <textarea required minLength={10} maxLength={4000} name={kind === "consultation" ? "description" : "message"} rows={6} className={input} />
      </Field>
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <input name="company_site" tabIndex={-1} autoComplete="off" />
      </div>
      {status === "err" ? <p className="text-sm text-red-700">{message}</p> : null}
      <button disabled={status === "busy"} className="h-11 rounded-md bg-ink px-4 text-sm font-medium text-paper disabled:opacity-50">
        {status === "busy" ? "Sending…" : kind === "consultation" ? "Request consultation" : "Send"}
      </button>
    </form>
  );
}

export function EnrollForm({ program }: { program: string }) {
  const [status, setStatus] = useState<"idle" | "busy" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");
  const initial = SCHOOLS.some((p) => p.slug === program) ? program : SCHOOLS[0]?.slug || "it";
  const [chosen, setChosen] = useState(initial);
  const school = SCHOOLS.find((p) => p.slug === chosen) || SCHOOLS[0];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("busy");
    setMessage("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const notes = String(fd.get("notes") || "").trim();
    const country = String(fd.get("country") || "uganda") === "international" ? "international" : "uganda";
    try {
      const res = await startCheckout({
        data: {
          name,
          email,
          phone,
          notes,
          program: chosen,
          country,
          honey: String(fd.get("company_site") || ""),
        },
      });
      if (res?.tx_ref) {
        window.location.href = `/enroll/pay?tx_ref=${encodeURIComponent(res.tx_ref)}`;
        return;
      }
      throw new Error("Could not start checkout.");
    } catch (err) {
      setStatus("err");
      setMessage(err instanceof Error ? err.message : "Could not start checkout.");
    }
  }

  return (
    <div className="rounded-xl border border-line bg-paper p-5">
      <form className="relative grid gap-4" onSubmit={onSubmit} noValidate>
        <Field label="Academy">
          <select name="program" className={input} value={chosen} onChange={(e) => setChosen(e.target.value)}>
            {SCHOOLS.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name} · ${p.amount_usd}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Full name">
          <input required name="name" className={input} autoComplete="name" minLength={2} />
        </Field>
        <Field label="Email">
          <input required type="email" name="email" className={input} autoComplete="email" />
        </Field>
        <Field label="Phone / WhatsApp">
          <input required name="phone" className={input} autoComplete="tel" />
        </Field>
        <Field label="Where you will pay from">
          <select name="country" className={input} defaultValue="uganda">
            <option value="uganda">Uganda — bank transfer (UGX) or mobile money</option>
            <option value="international">Outside Uganda — bank transfer (USD)</option>
          </select>
        </Field>
        <Field label="Message (optional)">
          <textarea name="notes" rows={4} maxLength={2000} className={input} placeholder="When you want to start, or any question." />
        </Field>
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <input name="company_site" tabIndex={-1} autoComplete="off" />
        </div>
        {status === "err" ? <p className="text-sm text-red-700">{message}</p> : null}
        <button disabled={status === "busy"} className="h-11 rounded-md bg-ink px-4 text-sm font-medium text-paper disabled:opacity-50">
          {status === "busy" ? "Opening payment…" : "Continue to payment"}
        </button>
      </form>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Next step shows pay by bank (USD / UGX) and Uganda mobile money. Prefer chat first? WhatsApp {WHATSAPP_DISPLAY}.
      </p>
      <a href={enrollWhatsapp(school.name)} className="mt-3 inline-flex h-11 items-center rounded-md border border-line px-4 text-sm">
        Ask on WhatsApp
      </a>
    </div>
  );
}
