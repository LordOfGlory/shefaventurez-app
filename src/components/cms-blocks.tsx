import { bodyToParagraphs } from "@/lib/security";
import type { PageRow } from "@/lib/page-defaults";

export function CmsHero({
  page,
  fallbackImage,
  large,
}: {
  page: PageRow;
  fallbackImage?: string;
  large?: boolean;
}) {
  const img = page.hero_image || fallbackImage || "";
  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      {img ? <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
      <div className="hero-shade absolute inset-0" />
      <div className={`relative mx-auto max-w-6xl px-5 ${large ? "py-28 md:py-40" : "py-24 md:py-28"}`}>
        {page.eyebrow ? (
          <p className="kicker text-paper/70">
            <i />
            {page.eyebrow}
          </p>
        ) : null}
        <h1 className={`mt-3 max-w-3xl font-semibold ${large ? "text-5xl md:text-7xl" : "text-4xl md:text-5xl"}`}>
          {page.heading || page.title}
        </h1>
        {page.lede ? <p className="mt-5 max-w-xl text-lg leading-relaxed text-paper/85">{page.lede}</p> : null}
      </div>
    </section>
  );
}

export function CmsBody({ text, className = "mt-4" }: { text: string; className?: string }) {
  const paras = bodyToParagraphs(text);
  if (!paras.length) return null;
  return (
    <div className={`prose-shefa ${className}`}>
      {paras.map((p) => (
        <p key={p.slice(0, 48)}>{p}</p>
      ))}
    </div>
  );
}

export function CmsCta({ page }: { page: PageRow }) {
  if (!page.cta_label || !page.cta_href) return null;
  const href = page.cta_href;
  const cls = "mt-8 inline-flex h-12 items-center rounded-md bg-ink px-5 text-sm font-medium text-paper transition hover:bg-ink/90";
  if (href.startsWith("http") || href.startsWith("/")) {
    return (
      <a href={href} className={cls} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {page.cta_label}
      </a>
    );
  }
  return (
    <a href={href} className={cls}>
      {page.cta_label}
    </a>
  );
}
