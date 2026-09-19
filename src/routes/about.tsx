import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/site-chrome";
import { getPage } from "@/lib/cms";
import { pageDefault } from "@/lib/page-defaults";
import { CmsBody, CmsCta, CmsHero } from "@/components/cms-blocks";
import { safeLoad } from "@/lib/admin-load";

export const Route = createFileRoute("/about")({
  loader: () => safeLoad(() => getPage({ data: { slug: "about" } }), pageDefault("about")),
  component: About,
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title || "About | Shefa Venturez" }] }),
});

function About() {
  const page = Route.useLoaderData() ?? pageDefault("about");
  return (
    <PublicShell>
      <CmsHero page={page} fallbackImage="/img/meeting.jpg" />
      <article className="mx-auto max-w-3xl px-5 py-16">
        <CmsBody text={page.body} className="mt-0" />
        <CmsCta page={page} />
      </article>
    </PublicShell>
  );
}
