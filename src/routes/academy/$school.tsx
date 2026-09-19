import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicShell } from "@/components/site-chrome";
import { SOCIAL } from "@/lib/content";
import { getProgram } from "@/lib/cms";
import { CmsBody } from "@/components/cms-blocks";

export const Route = createFileRoute("/academy/$school")({
  loader: async ({ params }) => {
    const school = await getProgram({ data: { slug: params.school } });
    if (!school) throw notFound();
    return school;
  },
  component: School,
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.name ?? "Academy"} | Shefa Venturez` }] }),
});

function School() {
  const school = Route.useLoaderData();
  const image = school.slug === "cyber" ? "/img/cyber-pro.jpg" : school.slug === "forex" ? "/img/charts-desk.jpg" : "/img/code.jpg";
  return (
    <PublicShell>
      <section className="relative overflow-hidden bg-ink text-paper">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="relative mx-auto max-w-6xl px-5 py-24">
          <p className="text-xs uppercase tracking-wider text-paper/70">{school.name}</p>
          <h1 className="mt-3 text-4xl font-semibold">{school.name}</h1>
          <p className="mt-4 max-w-xl text-paper/80">{school.summary}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/enroll" search={{ program: school.slug }} className="rounded-md bg-paper px-4 py-2.5 text-sm font-medium text-ink">
              Enroll
            </Link>
          </div>
        </div>
      </section>
      <article className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-lg font-semibold">
          ${school.amount_usd} · ≈ UGX {school.amount_ugx.toLocaleString()} · {school.duration}
        </p>
        <CmsBody
          text={
            school.body ||
            "New students enroll every month. One academy at a time. A place is confirmed after we see the payment by bank transfer or Uganda mobile money."
          }
          className="mt-4"
        />
        {school.slug === "forex" ? (
          <div className="mt-10 space-y-4 rounded-xl border border-line p-6">
            <h2 className="text-xl font-semibold">Free first</h2>
            <p className="text-sm leading-relaxed text-muted">
              Use School of Pipsology on BabyPips (their course — we do not host their book). Then take the Shefa foundation PDF. Request the paid place if you still want supervision. Trading can result in loss of capital.
            </p>
            <div className="flex flex-wrap gap-3">
              <a className="inline-flex h-11 items-center rounded-md bg-ink px-4 text-sm text-paper" href="https://www.babypips.com/learn/forex" target="_blank" rel="noreferrer">
                School of Pipsology
              </a>
              <Link to="/download" className="inline-flex h-11 items-center rounded-md border border-line px-4 text-sm">
                Get the free PDF
              </Link>
              <a
                className="inline-flex h-11 items-center rounded-md border border-line px-4 text-sm"
                href={SOCIAL.telegram.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                Free Telegram insights
              </a>
            </div>
          </div>
        ) : null}
      </article>
    </PublicShell>
  );
}
