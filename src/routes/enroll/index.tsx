import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/site-chrome";
import { EnrollForm } from "@/components/forms";
import { getPage } from "@/lib/cms";
import { SCHOOLS } from "@/lib/content";
import { pageDefault } from "@/lib/page-defaults";
import { CmsBody } from "@/components/cms-blocks";
import { safeLoad } from "@/lib/admin-load";

type Search = { program?: string };

export const Route = createFileRoute("/enroll/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    program: typeof s.program === "string" ? s.program : "it",
  }),
  loader: async () => {
    const page = await safeLoad(() => getPage({ data: { slug: "enroll" } }), pageDefault("enroll"));
    return { page: page ?? pageDefault("enroll") };
  },
  component: Enroll,
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.page.title || "Enroll | Shefa Venturez" }] }),
});

function Enroll() {
  const { program } = Route.useSearch();
  const { page } = Route.useLoaderData();
  return (
    <PublicShell>
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-2 md:items-start">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">{page.eyebrow || "Academy"}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">{page.heading}</h1>
          {page.lede ? <p className="mt-4 leading-relaxed text-muted">{page.lede}</p> : null}
          <CmsBody text={page.body} className="mt-4" />
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {SCHOOLS.map((p) => (
              <li key={p.slug} className="flex items-baseline justify-between gap-4 py-3">
                <span className="font-medium">{p.name}</span>
                <span className="text-sm text-muted">
                  ${p.amount_usd} · ≈ UGX {p.amount_ugx.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
          <ol className="mt-8 space-y-3 text-sm text-muted">
            <li>1. Pick one school.</li>
            <li>2. Continue to payment — pay by bank (USD or UGX) or Uganda mobile money.</li>
            <li>3. Use the payment reference as the transfer narration.</li>
            <li>4. A place is confirmed after we see the payment.</li>
          </ol>
        </div>
        <EnrollForm program={program || "it"} />
      </section>
    </PublicShell>
  );
}
