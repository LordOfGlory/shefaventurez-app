import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/site-chrome";
import { InquiryForm } from "@/components/forms";
import { WHATSAPP_DISPLAY, WHATSAPP_HREF } from "@/lib/content";
import { getPage } from "@/lib/cms";
import { pageDefault } from "@/lib/page-defaults";
import { CmsBody } from "@/components/cms-blocks";
import { safeLoad } from "@/lib/admin-load";

export const Route = createFileRoute("/consultation")({
  loader: () => safeLoad(() => getPage({ data: { slug: "consultation" } }), pageDefault("consultation")),
  component: Consultation,
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title || "Consultation | Shefa Venturez" }] }),
});

function Consultation() {
  const page = Route.useLoaderData() ?? pageDefault("consultation");
  return (
    <PublicShell>
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-2 md:items-start">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">{page.eyebrow || "Consultation"}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">{page.heading}</h1>
          {page.lede ? <p className="mt-4 leading-relaxed text-muted">{page.lede}</p> : null}
          <CmsBody text={page.body} className="mt-6" />
          <a href={WHATSAPP_HREF} className="mt-6 inline-flex h-11 items-center rounded-md bg-wa px-4 text-sm font-medium text-paper">
            {page.cta_label || `Message ${WHATSAPP_DISPLAY}`}
          </a>
        </div>
        <InquiryForm kind="consultation" />
      </section>
    </PublicShell>
  );
}
