import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { CONTACT_EMAIL, CYBER_SERVICES, IT_SERVICES, SITE_URL, SOCIAL, WHATSAPP_DISPLAY, WHATSAPP_HREF, AREA_NOTE } from "@/lib/content";
import { WaDock } from "@/components/wa-dock";

function navActive(path: string, href: string) {
  if (href === "/") return path === "/";
  return path === href || path.startsWith(href + "/");
}

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Shefa Venturez",
      url: SITE_URL,
      logo: `${SITE_URL}/img/logo.png`,
      image: `${SITE_URL}/og.jpg`,
      email: CONTACT_EMAIL,
      telephone: "+256763533786",
      description:
        "IT services, authorized cybersecurity, and academy training. Serving Uganda and worldwide. New academy students enroll every month.",
      areaServed: [{ "@type": "Country", name: "Uganda" }, "Worldwide"],
      sameAs: [SOCIAL.x.href, SOCIAL.facebook.href],
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+256-763-533-786",
          contactType: "customer service",
          areaServed: ["UG"],
          availableLanguage: ["English"],
        },
      ],
    },
    {
      "@type": "EducationalOrganization",
      name: "Shefa Venturez Academy",
      url: `${SITE_URL}/academy`,
      parentOrganization: { "@type": "Organization", name: "Shefa Venturez" },
    },
  ],
};

export function PublicShell({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/92 backdrop-blur-md">
        <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-5">
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <img src="/img/logo.png" alt="Shefa Venturez" className="h-9 w-auto" />
          </Link>
          <nav className="hidden items-center gap-7 text-[0.9375rem] lg:flex">
            <TopLink to="/" path={path}>
              Home
            </TopLink>
            <TopLink to="/about" path={path}>
              About
            </TopLink>
            <div className="group relative">
              <Link to="/it-services" className={`inline-block py-5 ${navActive(path, "/it-services") || navActive(path, "/cybersecurity") || navActive(path, "/services") ? "font-medium" : "text-muted hover:text-ink"}`}>
                Services
              </Link>
              <div className="invisible absolute left-0 top-full z-50 grid w-[36rem] grid-cols-2 gap-6 rounded-xl border border-line bg-paper p-6 opacity-0 shadow-lg transition duration-200 group-hover:visible group-hover:opacity-100">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted">IT</p>
                  {IT_SERVICES.map((s) => (
                    <a key={s.slug} href={`/services/${s.slug}`} className="mt-2 block text-sm text-muted hover:text-ink">
                      {s.title}
                    </a>
                  ))}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted">Cybersecurity</p>
                  {CYBER_SERVICES.map((s) => (
                    <a key={s.slug} href={`/cybersecurity/${s.slug}`} className="mt-2 block text-sm text-muted hover:text-ink">
                      {s.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="group relative">
              <Link to="/academy" className={`inline-block py-5 ${navActive(path, "/academy") || navActive(path, "/enroll") ? "font-medium" : "text-muted hover:text-ink"}`}>
                Academy
              </Link>
              <div className="invisible absolute left-0 top-full z-50 w-72 space-y-2 rounded-xl border border-line bg-paper p-6 opacity-0 shadow-lg transition duration-200 group-hover:visible group-hover:opacity-100">
                <Mega to="/academy/it">IT Academy · $349</Mega>
                <Mega to="/academy/cyber">Cyber Academy · $429</Mega>
                <Mega to="/academy/forex">Forex Academy · $299</Mega>
                <Mega to="/download">Free Forex PDF</Mega>
                <a href={SOCIAL.telegram.href} className="mt-2 block text-sm text-muted hover:text-ink" target="_blank" rel="noopener noreferrer">
                  Forex insights — Telegram (free)
                </a>
                <Mega to="/enroll">Enroll</Mega>
              </div>
            </div>
            <TopLink to="/resources" path={path}>
              Resources
            </TopLink>
            <TopLink to="/contact" path={path}>
              Contact
            </TopLink>
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <a href={WHATSAPP_HREF} className="rounded-md px-3 py-2 text-sm text-muted hover:text-ink">
              WhatsApp
            </a>
            <Link to="/enroll" className="rounded-md border border-line px-4 py-2 text-sm font-medium hover:border-ink">
              Enroll
            </Link>
            <Link to="/consultation" className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90">
              Get started
            </Link>
          </div>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-md border border-line lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open ? (
          <div className="border-t border-line bg-paper px-5 py-5 lg:hidden">
            <div className="grid gap-1 text-base">
              {[
                ["/", "Home"],
                ["/about", "About"],
                ["/it-services", "IT services"],
                ["/cybersecurity", "Cybersecurity"],
                ["/academy", "Academy"],
                ["/download", "Free Forex PDF"],
                ["/enroll", "Enroll"],
                ["/resources", "Resources"],
                ["/contact", "Contact"],
              ].map(([to, label]) => (
                <Link key={to} to={to} className="flex min-h-11 items-center" onClick={() => setOpen(false)}>
                  {label}
                </Link>
              ))}
              <a href={SOCIAL.telegram.href} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center" onClick={() => setOpen(false)}>
                Forex insights — Telegram
              </a>
              <div className="mt-3 grid gap-2">
                <Link to="/consultation" className="inline-flex h-12 items-center justify-center rounded-md bg-ink text-sm font-medium text-paper" onClick={() => setOpen(false)}>
                  Get started
                </Link>
                <a href={WHATSAPP_HREF} className="inline-flex h-12 items-center justify-center rounded-md border border-line text-sm">
                  WhatsApp {WHATSAPP_DISPLAY}
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </header>
      <main key={path}>{children}</main>
      <footer className="border-t border-line bg-fog">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-4">
          <div>
            <img src="/img/logo.png" alt="Shefa Venturez" className="h-8 w-auto" />
            <p className="mt-4 text-sm font-medium">Build. Secure. Learn.</p>
            <p className="mt-2 text-sm text-muted">{AREA_NOTE}</p>
          </div>
          <Col
            title="Company"
            links={[
              ["/", "Home"],
              ["/about", "About"],
              ["/contact", "Contact"],
              ["/consultation", "Consultation"],
            ]}
          />
          <div>
            <p className="text-sm font-semibold">Work</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <Link to="/it-services">IT services</Link>
              </li>
              <li>
                <Link to="/cybersecurity">Cybersecurity</Link>
              </li>
              <li>
                <Link to="/academy">Academy</Link>
              </li>
              <li>
                <Link to="/enroll">Enroll</Link>
              </li>
              <li>
                <Link to="/download">Free Forex PDF</Link>
              </li>
              <li>
                <a href={SOCIAL.telegram.href} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                  Forex insights — Telegram (free)
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Contact</p>
            <p className="mt-3 text-sm text-muted">{CONTACT_EMAIL}</p>
            <a href={WHATSAPP_HREF} className="text-sm text-muted hover:text-ink">
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
              <a href={SOCIAL.x.href} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                {SOCIAL.x.label}
              </a>
              <a href={SOCIAL.facebook.href} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                {SOCIAL.facebook.label}
              </a>
            </div>
          </div>
        </div>
        <p className="border-t border-line px-5 py-4 text-center text-xs text-muted">
          © {new Date().getFullYear()} Shefa Venturez. Forex content is education and can result in loss of capital.{" "}
          <Link to="/privacy" className="hover:text-ink">
            Privacy
          </Link>
          {" · "}
          <Link to="/terms" className="hover:text-ink">
            Terms
          </Link>
          {" · "}
          <Link to="/disclaimer" className="hover:text-ink">
            Disclaimer
          </Link>
          {" · "}
          <Link to="/cookies" className="hover:text-ink">
            Cookies
          </Link>
        </p>
      </footer>
      <WaDock />
    </div>
  );
}

function TopLink({ to, path, children }: { to: string; path: string; children: React.ReactNode }) {
  const on = navActive(path, to);
  return (
    <Link to={to} className={on ? "font-medium" : "text-muted hover:text-ink"}>
      {children}
    </Link>
  );
}

function Mega({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="mt-2 block text-sm text-muted hover:text-ink">
      {children}
    </Link>
  );
}

function Col({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-muted">
        {links.map(([to, label]) => (
          <li key={to}>
            <Link to={to}>{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
