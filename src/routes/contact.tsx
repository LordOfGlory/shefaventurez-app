import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/site-chrome";
import { InquiryForm } from "@/components/forms";
import { CONTACT_EMAIL, SOCIAL, WHATSAPP_DISPLAY, WHATSAPP_HREF } from "@/lib/content";
import { getPage } from "@/lib/cms";
import { pageDefault } from "@/lib/page-defaults";
import { CmsBody } from "@/components/cms-blocks";
import { safeLoad } from "@/lib/admin-load";

export const Route = createFileRoute("/contact")({
  loader: () => safeLoad(() => getPage({ data: { slug: "contact" } }), pageDefault("contact")),
  component: Contact,
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title || "Contact | Shefa Venturez" }] }),
});

function Contact() {
  const page = Route.useLoaderData() ?? pageDefault("contact");
  return (
    <PublicShell>
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">{page.eyebrow || "Contact"}</p>
          <h1 className="mt-2 text-4xl font-semibold">{page.heading}</h1>
          <p className="mt-4 text-muted">
            {CONTACT_EMAIL}
            <br />
            <a href={WHATSAPP_HREF} className="hover:text-ink">
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
          </p>
          <p className="mt-4 text-sm text-muted">
            <a href={SOCIAL.x.href} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
              {SOCIAL.x.handle}
            </a>
            {" · "}
            <a href={SOCIAL.facebook.href} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
              Facebook
            </a>
          </p>
          <p className="mt-3 text-sm text-muted">
            Forex learners: free insights on{" "}
            <a href={SOCIAL.telegram.href} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-4 hover:text-ink">
              Telegram
            </a>
            . Not for IT or cybersecurity work.
          </p>
          {page.lede && page.lede.indexOf("shefaventurez") === -1 ? <p className="mt-4 text-sm text-muted">{page.lede}</p> : null}
          <CmsBody text={page.body} className="mt-4" />
        </div>
        <InquiryForm kind="contact" />
      </section>
    </PublicShell>
  );
}
