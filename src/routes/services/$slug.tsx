import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicShell } from "@/components/site-chrome";
import { getService } from "@/lib/cms";
import { CmsBody } from "@/components/cms-blocks";

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ params }) => {
    const item = await getService({ data: { slug: params.slug } });
    if (!item || item.kind === "cyber") throw notFound();
    return item;
  },
  component: Service,
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.title ?? "Service"} | Shefa Venturez` }] }),
});

function Service() {
  const item = Route.useLoaderData();
  return (
    <PublicShell>
      <section className="relative overflow-hidden bg-ink text-paper">
        <img src="/img/code.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="relative mx-auto max-w-6xl px-5 py-24">
          <p className="text-xs uppercase tracking-wider text-paper/70">IT Services</p>
          <h1 className="mt-3 text-4xl font-semibold">{item.title}</h1>
        </div>
      </section>
      <article className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-lg leading-relaxed text-muted">{item.summary}</p>
        <CmsBody
          text={
            item.body ||
            "Work starts with a written scope: what is in, what is out, who owns it, and what the first release is allowed to be."
          }
        />
        <Link to="/consultation" className="mt-8 inline-block rounded-md bg-ink px-4 py-2.5 text-sm text-paper">
          Request a consultation
        </Link>
      </article>
    </PublicShell>
  );
}
