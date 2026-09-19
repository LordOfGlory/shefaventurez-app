import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicShell } from "@/components/site-chrome";
import { getArticle } from "@/lib/cms";
import { bodyToParagraphs } from "@/lib/security";

export const Route = createFileRoute("/resources/$slug")({
  loader: async ({ params }) => {
    const article = await getArticle({ data: { slug: params.slug } });
    if (!article) throw notFound();
    return article;
  },
  component: Article,
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.title ?? "Resources"} | Shefa Venturez` }] }),
});

function Article() {
  const a = Route.useLoaderData();
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-xs uppercase tracking-wider text-muted">
          {a.category} · {a.minutes} min
        </p>
        <h1 className="mt-2 text-4xl font-semibold">{a.title}</h1>
        <div className="prose-shefa mt-8">
          {bodyToParagraphs(a.body).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <Link to="/resources" className="mt-10 inline-block text-sm text-muted">
          All resources
        </Link>
      </article>
    </PublicShell>
  );
}
