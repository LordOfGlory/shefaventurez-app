import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/site-chrome";
import { getPage, listArticles } from "@/lib/cms";
import { pageDefault } from "@/lib/page-defaults";
import { CmsBody } from "@/components/cms-blocks";
import { safeLoad } from "@/lib/admin-load";

export const Route = createFileRoute("/resources/")({
  loader: async () => {
    const [articles, page] = await Promise.all([
      safeLoad(() => listArticles(), []),
      safeLoad(() => getPage({ data: { slug: "resources" } }), pageDefault("resources")),
    ]);
    return { articles, page: page ?? pageDefault("resources") };
  },
  component: Resources,
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.page.title || "Resources | Shefa Venturez" }] }),
});

function Resources() {
  const { articles, page } = Route.useLoaderData();
  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-xs uppercase tracking-wider text-muted">{page.eyebrow || "Resources"}</p>
        <h1 className="mt-2 text-4xl font-semibold">{page.heading}</h1>
        {page.lede ? <p className="mt-4 max-w-2xl text-muted">{page.lede}</p> : null}
        <CmsBody text={page.body} />
        <a href="/download" className="mt-10 flex flex-col justify-between gap-4 rounded-xl border border-ink bg-paper p-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">Free curriculum</p>
            <h2 className="mt-2 text-xl font-semibold">Forex Foundation PDF</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              14 units, practice tasks and fail conditions. Leave an email — we record the download, then the file starts.
            </p>
          </div>
          <span className="inline-flex h-11 shrink-0 items-center rounded-md bg-ink px-4 text-sm font-medium text-paper">Get the PDF</span>
        </a>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {articles.length === 0 ? <p className="text-sm text-muted">Articles will appear here.</p> : null}
          {articles.map((a) => (
            <Link key={a.slug} to="/resources/$slug" params={{ slug: a.slug }} className="rounded-xl border border-line p-5 hover:border-ink">
              <p className="text-xs uppercase tracking-wider text-muted">{a.category}</p>
              <h2 className="mt-2 font-semibold">{a.title}</h2>
              <p className="mt-2 text-sm text-muted">{a.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
