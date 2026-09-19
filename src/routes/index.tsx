import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/site-chrome";
import { PAY_BLURB, SCHOOLS } from "@/lib/content";
import { getPage, listPrograms } from "@/lib/cms";
import { pageDefault } from "@/lib/page-defaults";
import { safeLoad } from "@/lib/admin-load";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [page, programs] = await Promise.all([
      safeLoad(() => getPage({ data: { slug: "home" } }), pageDefault("home")),
      safeLoad(() => listPrograms(), []),
    ]);
    return { page: page ?? pageDefault("home"), programs };
  },
  component: Home,
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.page.title || "Shefa Venturez | Build. Secure. Learn." }] }),
});

const SCHOOL_IMG: Record<string, string> = {
  it: "/img/code.jpg",
  cyber: "/img/cyber-pro.jpg",
  forex: "/img/charts-desk.jpg",
};

function Home() {
  const data = Route.useLoaderData();
  const page = data?.page ?? pageDefault("home");
  const programs = data?.programs ?? [];
  const schools = programs.length
    ? programs
    : SCHOOLS.map((s) => ({ slug: s.slug, name: s.name, summary: s.summary, amount_usd: s.amount_usd, amount_ugx: s.amount_ugx, duration: s.duration }));
  const img = page.hero_image || "/img/office-team.jpg";
  return (
    <PublicShell>
      <section className="relative overflow-hidden bg-ink text-paper">
        <video
          className="hero-video absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={img}
        >
          <source src="/img/hero.mp4" type="video/mp4" />
        </video>
        <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover motion-reduce:block hidden" />
        <div className="hero-shade absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-5 py-28 md:py-40">
          <p className="kicker text-paper/75">
            <i />
            {page.eyebrow || "Build. Secure. Learn."}
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl lg:text-7xl">{page.heading}</h1>
          {page.lede ? <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/85">{page.lede}</p> : null}
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={page.cta_href || "/consultation"} className="inline-flex h-12 items-center rounded-md bg-paper px-6 text-sm font-medium text-ink hover:bg-fog">
              {page.cta_label || "Talk to an expert"}
            </a>
            <Link to="/academy" className="inline-flex h-12 items-center rounded-md border border-paper/40 px-6 text-sm hover:border-paper">
              Explore the academy
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-20 md:grid-cols-3">
        {[
          ["Build", "IT services", "/it-services", "Web, mobile, software, cloud and operations — scoped before we write code.", "/img/code.jpg"],
          ["Secure", "Cybersecurity", "/cybersecurity", "Authorized testing, monitoring and response. No unsolicited scanning.", "/img/soc-room.jpg"],
          ["Learn", "Academy", "/academy", "One school at a time. IT, Cyber, or Forex. New students enroll every month.", "/img/classroom.jpg"],
        ].map(([k, t, href, d, src]) => (
          <Link key={t} to={href} className="group overflow-hidden rounded-2xl border border-line bg-paper transition hover:border-ink">
            <div className="relative h-40 overflow-hidden">
              <img src={src} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <div className="p-6">
              <p className="text-xs uppercase tracking-wider text-muted">{k}</p>
              <h2 className="mt-2 text-xl font-semibold">{t}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{d}</p>
            </div>
          </Link>
        ))}
      </section>

      {[
        {
          k: "IT Services",
          t: "Reliable systems your team can actually use.",
          d: "From websites to infrastructure — we start with the problem, not a catalogue of tools.",
          href: "/it-services",
          label: "Talk to an IT expert",
          src: "/img/code.jpg",
        },
        {
          k: "Cybersecurity",
          t: "Authorized testing. Defensive work. Written scope.",
          d: "We do not test systems we are not permitted to test. Findings come with practical next steps.",
          href: "/cybersecurity",
          label: "Request a security assessment",
          src: "/img/cyber-pro.jpg",
        },
        {
          k: "Academy",
          t: "Learn. Build. Secure. Trade. Grow.",
          d: "IT $349 · Cyber $429 · Forex free lessons, then $299. One school at a time. New students enroll every month.",
          href: "/academy",
          label: "Explore courses",
          src: "/img/academy-africa.jpg",
        },
      ].map((p) => (
        <section key={p.k} className="panel-photo relative overflow-hidden bg-ink text-paper">
          <img src={p.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="hero-shade absolute inset-0" />
          <div className="relative mx-auto flex min-h-[28rem] max-w-6xl items-end px-5 py-16">
            <div className="max-w-xl">
              <p className="kicker text-paper/70">
                <i />
                {p.k}
              </p>
              <h2 className="mt-4 text-3xl font-semibold md:text-4xl">{p.t}</h2>
              <p className="mt-3 text-sm leading-relaxed text-paper/80 md:text-base">{p.d}</p>
              <Link to={p.href} className="mt-6 inline-flex h-12 items-center rounded-md bg-paper px-5 text-sm font-medium text-ink">
                {p.label}
              </Link>
            </div>
          </div>
        </section>
      ))}

      <section className="bg-fog">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold md:text-4xl">Academy</h2>
              <p className="mt-3 max-w-xl text-muted">New students enroll every month. Tuition in USD. {PAY_BLURB}</p>
            </div>
            <Link to="/enroll" className="inline-flex h-11 shrink-0 items-center rounded-md bg-ink px-5 text-sm font-medium text-paper">
              Enroll
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {schools.map((s) => (
              <article key={s.slug} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-paper">
                <img src={SCHOOL_IMG[s.slug] || "/img/learning.jpg"} alt="" className="h-44 w-full object-cover" />
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{s.summary}</p>
                  <p className="mt-5 text-2xl font-semibold">${s.amount_usd}</p>
                  <p className="text-sm text-muted">
                    {s.duration} · ≈ UGX {s.amount_ugx.toLocaleString()}
                  </p>
                  <Link
                    to="/academy/$school"
                    params={{ school: s.slug }}
                    className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-ink px-3 text-sm font-medium text-paper"
                  >
                    View
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-line bg-ink text-paper">
        <img src="/img/charts-desk.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="hero-shade absolute inset-0" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-5 py-16 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-paper/70">Free curriculum</p>
            <h2 className="mt-2 text-2xl font-semibold md:text-3xl">Forex Foundation PDF</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-paper/80">
              14 units, practice tasks and fail conditions. Leave a name and email — then the file downloads. Education only.
            </p>
          </div>
          <Link to="/download" className="inline-flex h-12 shrink-0 items-center rounded-md bg-paper px-5 text-sm font-medium text-ink">
            Get the PDF
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-3xl font-semibold md:text-4xl">Our standard</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[
            ["Written scope", "IT work starts with what is in, what is out, and who owns it."],
            ["Written permission", "Security testing does not start without authorization."],
            ["One academy", "Students join one school so the work can finish."],
            ["Education, not theatre", "Forex has no invented win rates. Capital can be lost."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-line p-6">
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-fog">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="text-xs uppercase tracking-wider text-muted">How we work</p>
          <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Scope first. Then work.</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {[
              ["01", "Consult", "We establish whether you need to build, protect, or learn — and what success looks like."],
              ["02", "Plan", "You receive a written scope: deliverables, timeline, and what is out of bounds."],
              ["03", "Deliver", "We execute with documentation. Security work stays authorized. Academy places confirm after payment."],
            ].map(([n, t, d]) => (
              <article key={n}>
                <p className="text-sm tabular-nums text-muted">{n}</p>
                <h3 className="mt-3 text-xl font-semibold">{t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-20">
        <p className="text-xs uppercase tracking-wider text-muted">Questions</p>
        <h2 className="mt-2 text-3xl font-semibold md:text-4xl">If you are new here</h2>
        <dl className="mt-10 divide-y divide-line border-y border-line">
          {[
            ["How do we start?", "Use Get started for a project or assessment, or Explore the academy. We reply from shefaventurez@outlook.com or WhatsApp +256 763 533 786."],
            ["Do you test systems without permission?", "No. Security testing starts only with written authorization and a defined scope."],
            ["Can I join more than one academy?", `Join one school at a time. Forex starts free. Paid places: ${PAY_BLURB} Enroll on the enroll page.`],
            ["Does Forex training guarantee profit?", "No. It is education. Trading can result in loss of capital."],
          ].map(([q, a]) => (
            <div key={q} className="py-6">
              <dt className="font-medium">{q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">{a}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/consultation" className="inline-flex h-12 items-center rounded-md bg-ink px-5 text-sm font-medium text-paper">
            Get started
          </Link>
          <Link to="/academy" className="inline-flex h-12 items-center rounded-md border border-line px-5 text-sm">
            Explore the academy
          </Link>
        </div>
      </section>

      <section className="border-t border-line bg-fog">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-16 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="kicker text-muted">
              <i />
              Next step
            </p>
            <h2 className="mt-3 text-2xl font-semibold md:text-3xl">Tell us what you need built, protected, or learned.</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">One conversation. One recommended path. Uganda WhatsApp +256 763 533 786.</p>
          </div>
          <Link to="/consultation" className="inline-flex h-12 shrink-0 items-center rounded-md bg-ink px-5 text-sm font-medium text-paper">
            Get started
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
