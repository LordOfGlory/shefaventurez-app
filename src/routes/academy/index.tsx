import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/site-chrome";
import { SCHOOLS } from "@/lib/content";
import { getPage, listPrograms } from "@/lib/cms";
import { pageDefault } from "@/lib/page-defaults";
import { CmsHero } from "@/components/cms-blocks";
import { safeLoad } from "@/lib/admin-load";

export const Route = createFileRoute("/academy/")({
  loader: async () => {
    const [page, programs] = await Promise.all([
      safeLoad(() => getPage({ data: { slug: "academy" } }), pageDefault("academy")),
      safeLoad(() => listPrograms(), []),
    ]);
    return { page: page ?? pageDefault("academy"), programs };
  },
  component: Academy,
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.page.title || "Academy | Shefa Venturez" }] }),
});

function Academy() {
  const { page, programs } = Route.useLoaderData();
  const list = programs.length
    ? programs
    : SCHOOLS.map((s, i) => ({
        id: i,
        slug: s.slug,
        name: s.name,
        summary: s.summary,
        price_label: `$${s.amount_usd} · ≈ UGX ${s.amount_ugx.toLocaleString()}`,
        duration: s.duration,
      }));
  return (
    <PublicShell>
      <CmsHero page={page} fallbackImage="/img/academy-africa.jpg" />
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {list.map((p) => (
            <article key={p.slug} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-paper">
              <img
                src={p.slug === "cyber" ? "/img/cyber-pro.jpg" : p.slug === "forex" ? "/img/charts-desk.jpg" : "/img/code.jpg"}
                alt=""
                className="h-44 w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-lg font-semibold">{p.name}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{p.summary}</p>
                <p className="mt-4 font-semibold">{p.price_label}</p>
                <p className="text-sm text-muted">{p.duration}</p>
                <div className="mt-6 flex gap-2">
                  <Link to="/academy/$school" params={{ school: p.slug }} className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-line px-3 text-sm">
                    View
                  </Link>
                  <Link to="/enroll" search={{ program: p.slug }} className="inline-flex h-11 flex-1 items-center justify-center rounded-md bg-ink px-3 text-sm font-medium text-paper">
                    Enroll
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
