import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { PublicShell } from "@/components/site-chrome";
import { getPage } from "@/lib/cms";
import { isCorePage, publicPathForPage } from "@/lib/page-defaults";
import { CmsBody, CmsCta } from "@/components/cms-blocks";

export const Route = createFileRoute("/pages/$slug")({
  loader: async ({ params }) => {
    if (isCorePage(params.slug)) {
      throw redirect({ href: publicPathForPage(params.slug) });
    }
    const page = await getPage({ data: { slug: params.slug } });
    if (!page || (!page.heading && !page.body)) throw notFound();
    return page;
  },
  component: CustomPage,
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title || "Shefa Venturez" }] }),
});

function CustomPage() {
  const page = Route.useLoaderData();
  return (
    <PublicShell>
      <section className="mx-auto max-w-3xl px-5 py-16">
        {page.eyebrow ? <p className="text-xs uppercase tracking-wider text-muted">{page.eyebrow}</p> : null}
        <h1 className="mt-2 text-4xl font-semibold">{page.heading || page.title}</h1>
        {page.lede ? <p className="mt-4 leading-relaxed text-muted">{page.lede}</p> : null}
        <CmsBody text={page.body} className="mt-8" />
        <CmsCta page={page} />
      </section>
    </PublicShell>
  );
}
