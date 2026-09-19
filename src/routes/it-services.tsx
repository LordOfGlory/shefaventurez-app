import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/site-chrome";
import { IT_SERVICES } from "@/lib/content";
import { getPage, listServices } from "@/lib/cms";
import { pageDefault } from "@/lib/page-defaults";
import { CmsHero } from "@/components/cms-blocks";
import { safeLoad } from "@/lib/admin-load";

export const Route = createFileRoute("/it-services")({
  loader: async () => {
    const [page, services] = await Promise.all([
      safeLoad(() => getPage({ data: { slug: "it-services" } }), pageDefault("it-services")),
      safeLoad(() => listServices({ data: { kind: "it" } }), IT_SERVICES.map((s, i) => ({ id: i, slug: s.slug, kind: "it", title: s.title, summary: s.summary, body: "", status: "published", sort_order: i }))),
    ]);
    return { page: page ?? pageDefault("it-services"), services };
  },
  component: IT,
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.page.title || "IT Services | Shefa Venturez" }] }),
});

function IT() {
  const { page, services } = Route.useLoaderData();
  return (
    <PublicShell>
      <CmsHero page={page} fallbackImage="/img/code.jpg" />
      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-16 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Link key={s.slug} to="/services/$slug" params={{ slug: s.slug }} className="rounded-xl border border-line p-5 hover:border-ink">
            <h2 className="font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm text-muted">{s.summary}</p>
          </Link>
        ))}
      </section>
    </PublicShell>
  );
}
