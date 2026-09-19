import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/site-chrome";
import { PdfDownloadForm, PdfCover } from "@/components/pdf-download";
import { CONTACT_EMAIL, PDF_UNITS, SOCIAL, WHATSAPP_DISPLAY } from "@/lib/content";

export const Route = createFileRoute("/download")({
  component: Download,
  head: () => ({
    meta: [
      { title: "Free Forex Foundation Curriculum | Shefa Venturez" },
      {
        name: "description",
        content:
          "Free 14-unit Forex Foundation Curriculum from Shefa Venturez. Leave a name and email, then the PDF downloads. Education only — trading can result in loss of capital.",
      },
    ],
  }),
});

const FOR = [
  ["For people who want a sequence they can fail", "Each unit has a practice task and a fail condition. Confidence is not a pass."],
  ["Before the paid academy", "The $299 Forex Academy assumes you can name a market, size risk in money, and produce a one-page plan."],
  ["Not for cash emergencies", "If you need this month’s rent from trading, do not use this — and do not enroll."],
];

const STEPS = [
  ["Leave a name and email", "That is how we know who has the file. We do not sell addresses."],
  ["The PDF downloads", "14 units plus a capstone folder you build yourself. Study 45–60 minutes a day, about 4–6 weeks."],
  ["Then decide", "Four free lessons stay on the academy page. Pay only if you want supervision of a written plan."],
];

const FAQ = [
  ["Is this BabyPips?", "No. School of Pipsology stays on BabyPips. This is original Shefa material. We do not host their book."],
  ["Do you email the file?", "No. After you submit, the PDF downloads in the browser. Your email is the record of who asked for it."],
  ["Does this enroll me?", "No. A paid place is a separate enrollment. Pay on the enroll page by bank transfer or Uganda mobile money."],
  ["Can trading lose money?", "Yes. This curriculum is education. It is not signals, not a managed account, and not a promise of profit."],
];

function Download() {
  return (
    <PublicShell>
      <section className="border-b border-line bg-fog">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1fr_22rem] md:items-start">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">Free curriculum</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Forex Foundation PDF</h1>
            <p className="mt-4 max-w-xl leading-relaxed text-muted">
              A study path for people who want to understand markets, cost, size, charts, plans and risk before they pay for supervision.
            </p>
            <div className="mt-8 flex flex-wrap items-end gap-8">
              <PdfCover />
              <ul className="space-y-3 text-sm">
                <li>
                  <span className="font-medium">14 units</span>
                  <span className="text-muted"> · objective, lessons, practice, fail condition</span>
                </li>
                <li>
                  <span className="font-medium">Capstone folder</span>
                  <span className="text-muted"> · a plan, size math, structure notes, a journal</span>
                </li>
                <li>
                  <span className="font-medium">Original Shefa writing</span>
                  <span className="text-muted"> · not a copy of anyone else’s course</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="md:sticky md:top-24">
            <PdfDownloadForm source="/download" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-3">
        {FOR.map(([t, d]) => (
          <article key={t}>
            <h2 className="font-semibold">{t}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
          </article>
        ))}
      </section>

      <section className="border-y border-line bg-fog">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="text-xs uppercase tracking-wider text-muted">Contents</p>
          <h2 className="mt-2 text-3xl font-semibold">What is inside</h2>
          <ol className="mt-10 grid gap-x-12 gap-y-3 sm:grid-cols-2">
            {PDF_UNITS.map(([n, t]) => (
              <li key={n} className="flex gap-3 border-b border-line py-2 text-sm">
                <span className="w-6 tabular-nums text-muted">{n}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-muted">Capstone: show a file — plan, size calculation, structure notes, journal — not a feeling.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-xs uppercase tracking-wider text-muted">How it works</p>
        <h2 className="mt-2 text-3xl font-semibold">Three steps</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map(([t, d], i) => (
            <article key={t}>
              <p className="text-xs tabular-nums text-muted">0{i + 1}</p>
              <h3 className="mt-2 font-semibold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-fog">
        <div className="mx-auto max-w-3xl px-5 py-16">
          <p className="text-xs uppercase tracking-wider text-muted">Questions</p>
          <h2 className="mt-2 text-3xl font-semibold">Before you download</h2>
          <dl className="mt-10 divide-y divide-line border-y border-line">
            {FAQ.map(([q, a]) => (
              <div key={q} className="py-5">
                <dt className="font-medium">{q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted">{a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-sm text-muted">
            Official contact is {CONTACT_EMAIL} and WhatsApp {WHATSAPP_DISPLAY}.{" "}
            <Link to="/academy/$school" params={{ school: "forex" }} className="underline decoration-line underline-offset-4 hover:text-ink">
              Four free lessons
            </Link>
            {" "}stay on the academy page. Forex insights (free) live on{" "}
            <a href={SOCIAL.telegram.href} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-4 hover:text-ink">
              Telegram
            </a>
            .
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
