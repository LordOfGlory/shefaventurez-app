import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { recordDownload } from "@/lib/cms";
import { CONTACT_EMAIL, PDF_HREF, WHATSAPP_DISPLAY, WHATSAPP_HREF } from "@/lib/content";

const field =
  "w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-base outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/20";

export function PdfCover() {
  return (
    <div className="flex h-64 w-44 shrink-0 flex-col justify-between rounded-sm bg-ink p-5 text-paper shadow-lg">
      <p className="text-xs uppercase tracking-wider text-paper/50">Shefa Academy</p>
      <div>
        <p className="text-2xl font-semibold leading-tight">Forex Foundation</p>
        <p className="mt-2 text-sm text-paper/70">14 units · practice · fail conditions</p>
      </div>
      <p className="text-xs text-paper/50">Education only</p>
    </div>
  );
}

export function PdfDownloadForm({ source }: { source: string }) {
  const [status, setStatus] = useState<"idle" | "busy" | "ok">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const honey = String(fd.get("company_site") || "");
    if (name.length < 2) {
      setError("Enter your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email.");
      return;
    }
    setStatus("busy");
    try {
      await recordDownload({ data: { name, email, source, honey, asset: "forex-starter" } });
    } catch {
      /* still deliver the file */
    }
    try {
      await fetch("https://formsubmit.co/ajax/" + CONTACT_EMAIL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name,
          email,
          source,
          asset: "Free Forex Foundation Curriculum",
          _subject: "Shefa PDF download",
          _template: "table",
          _captcha: "false",
          _replyto: email,
        }),
      });
    } catch {
      /* file still downloads */
    }
    const a = document.createElement("a");
    a.href = PDF_HREF;
    a.download = "shefa-forex-free-path.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setStatus("ok");
    form.reset();
  }

  if (status === "ok") {
    return (
      <div className="rounded-xl border border-line bg-paper p-6 shadow-sm">
        <p className="text-xs uppercase tracking-wider text-muted">Ready</p>
        <h2 className="mt-2 text-xl font-semibold">The PDF is downloading</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          If nothing started, save it below. Official contact remains {CONTACT_EMAIL} and WhatsApp {WHATSAPP_DISPLAY}.
        </p>
        <a href={PDF_HREF} className="mt-5 inline-flex h-11 items-center rounded-md bg-ink px-4 text-sm font-medium text-paper" download>
          Save the PDF
        </a>
        <div className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
          <p className="font-medium">What to do next</p>
          <Link to="/academy/$school" params={{ school: "forex" }} className="block text-muted hover:text-ink">
            Four free lessons on the academy page →
          </Link>
          <a href="https://www.babypips.com/learn/forex" className="block text-muted hover:text-ink" target="_blank" rel="noreferrer">
            School of Pipsology on BabyPips →
          </a>
          <a href={WHATSAPP_HREF} className="block text-muted hover:text-ink">
            WhatsApp {WHATSAPP_DISPLAY} →
          </a>
        </div>
      </div>
    );
  }

  return (
    <form className="relative grid gap-4 rounded-xl border border-line bg-paper p-5 shadow-sm" onSubmit={onSubmit} noValidate>
      <div>
        <p className="font-medium">Get the PDF</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">Name and email only. We do not sell addresses.</p>
      </div>
      <label className="block text-sm font-medium">
        Name
        <input required name="name" autoComplete="name" minLength={2} maxLength={80} className={`mt-1 ${field}`} />
      </label>
      <label className="block text-sm font-medium">
        Email
        <input required type="email" name="email" autoComplete="email" maxLength={120} className={`mt-1 ${field}`} />
      </label>
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <input name="company_site" tabIndex={-1} autoComplete="off" />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button disabled={status === "busy"} className="h-11 rounded-md bg-ink px-4 text-sm font-medium text-paper disabled:opacity-50">
        {status === "busy" ? "Preparing…" : "Get the PDF"}
      </button>
      <p className="text-xs leading-relaxed text-muted">
        Education only. Trading can result in loss of capital. We reply within one business day if you write after reading.
      </p>
    </form>
  );
}
