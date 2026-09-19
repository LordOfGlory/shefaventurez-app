export type PageFields = {
  slug: string;
  title: string;
  eyebrow: string;
  heading: string;
  lede: string;
  body: string;
  cta_label: string;
  cta_href: string;
  hero_image: string;
  status: string;
};

export type PageRow = PageFields & {
  id: number;
  updated_by: string | null;
  updated_at: string;
};

export const CORE_PAGE_SLUGS = [
  "home",
  "about",
  "contact",
  "consultation",
  "it-services",
  "cybersecurity",
  "academy",
  "enroll",
  "resources",
  "download",
] as const;

export const CORE_PROGRAM_SLUGS = ["it", "cyber", "forex"] as const;

export function isCorePage(slug: string) {
  return (CORE_PAGE_SLUGS as readonly string[]).includes(slug);
}

export function isCoreProgram(slug: string) {
  return (CORE_PROGRAM_SLUGS as readonly string[]).includes(slug);
}

export function publicPathForPage(slug: string): string {
  const map: Record<string, string> = {
    home: "/",
    about: "/about",
    contact: "/contact",
    consultation: "/consultation",
    "it-services": "/it-services",
    cybersecurity: "/cybersecurity",
    academy: "/academy",
    enroll: "/enroll",
    resources: "/resources",
    download: "/download",
  };
  return map[slug] || `/pages/${slug}`;
}

export function emptyPage(slug: string): PageRow {
  return {
    id: 0,
    slug,
    title: slug,
    eyebrow: "",
    heading: "",
    lede: "",
    body: "",
    cta_label: "",
    cta_href: "",
    hero_image: "",
    status: "draft",
    updated_by: null,
    updated_at: "",
  };
}

export const PAGE_DEFAULTS: Record<string, PageRow> = {
  home: {
    ...emptyPage("home"),
    title: "Shefa Venturez | Build. Secure. Learn.",
    eyebrow: "Technology · Cybersecurity · Academy",
    heading: "We build the systems, defend them, and train the people who keep both running.",
    lede: "Shefa Venturez is a Uganda technology practice for organisations that need software they can operate, security work that stays legal, and academy training that does not split attention. New academy students enroll every month.",
    cta_label: "Talk to an expert",
    cta_href: "/consultation",
    hero_image: "/img/office-team.jpg",
    status: "published",
  },
  about: {
    ...emptyPage("about"),
    title: "About | Shefa Venturez",
    eyebrow: "Company",
    heading: "A technology company that also teaches.",
    body: "Shefa Venturez exists to do three things well. We build software and infrastructure. We protect systems only with written permission. We train people — one academy at a time.\n\nWe do not invent clients, awards or pass rates. Trust is how we are allowed to work: written scope, authorized security, and no profit theatre in forex education.\n\nOfficial contact is shefaventurez@outlook.com and WhatsApp +256 763 533 786.",
    cta_label: "Request a consultation",
    cta_href: "/consultation",
    hero_image: "/img/meeting.jpg",
    status: "published",
  },
  contact: {
    ...emptyPage("contact"),
    title: "Contact | Shefa Venturez",
    eyebrow: "Contact",
    heading: "Write to us.",
    lede: "shefaventurez@outlook.com · WhatsApp +256 763 533 786",
    body: "Uganda WhatsApp +256 763 533 786. Organisations and students in Uganda and worldwide. Academy fees are paid by bank transfer (USD or UGX) or Uganda mobile money.\n\nDo not pay anyone who is not using those channels. We reply within one business day.",
    status: "published",
  },
  consultation: {
    ...emptyPage("consultation"),
    title: "Consultation | Shefa Venturez",
    eyebrow: "Consultation",
    heading: "Tell us what you need built or protected.",
    lede: "Share enough context for a written next step. Security testing is not requested by this form alone — authorization is a separate letter.",
    body: "We reply from shefaventurez@outlook.com within one business day. For a faster reply, WhatsApp +256 763 533 786.",
    cta_label: "Message WhatsApp",
    status: "published",
  },
  "it-services": {
    ...emptyPage("it-services"),
    title: "IT Services | Shefa Venturez",
    eyebrow: "IT Services",
    heading: "Software and infrastructure that can be operated.",
    lede: "Every engagement starts with a written scope.",
    hero_image: "/img/code.jpg",
    status: "published",
  },
  cybersecurity: {
    ...emptyPage("cybersecurity"),
    title: "Cybersecurity | Shefa Venturez",
    eyebrow: "Cybersecurity",
    heading: "Authorized and defensive. Always.",
    lede: "Testing starts only with written permission and a defined scope.",
    hero_image: "/img/cyber-pro.jpg",
    status: "published",
  },
  academy: {
    ...emptyPage("academy"),
    title: "Academy | Shefa Venturez",
    eyebrow: "Academy",
    heading: "One education brand. Three schools.",
    lede: "New students enroll every month. You join one path. A place is confirmed only after full payment.",
    hero_image: "/img/academy-africa.jpg",
    status: "published",
  },
  enroll: {
    ...emptyPage("enroll"),
    title: "Enroll | Shefa Venturez",
    eyebrow: "Academy",
    heading: "Pay for one school",
    lede: "New students enroll every month. Tuition is in US dollars. Pay by bank (USD worldwide, UGX in Uganda) or Uganda mobile money. A place is confirmed only after we see the payment.",
    status: "published",
  },
  resources: {
    ...emptyPage("resources"),
    title: "Resources | Shefa Venturez",
    eyebrow: "Resources",
    heading: "Practical writing you can use this week.",
    status: "published",
  },
  download: {
    ...emptyPage("download"),
    title: "Free Forex Foundation Curriculum | Shefa Venturez",
    eyebrow: "Free curriculum",
    heading: "Forex Foundation PDF",
    lede: "A study path for people who want to understand markets, cost, size, charts, plans and risk before they pay for supervision.",
    status: "published",
  },
};

export function pageDefault(slug: string): PageRow {
  return PAGE_DEFAULTS[slug] ?? emptyPage(slug);
}

export function mergePage(slug: string, row: Partial<PageRow> | null | undefined): PageRow {
  const base = pageDefault(slug);
  if (!row) return base;
  return {
    ...base,
    ...row,
    slug,
    title: row.title || base.title,
    heading: row.heading || base.heading,
  };
}
