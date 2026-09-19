export const CONTACT_EMAIL = "shefaventurez@outlook.com";
export const WHATSAPP_DISPLAY = "+256 763 533 786";
export const WHATSAPP_LOCAL = "0763533786";
export const WHATSAPP_E164 = "256763533786";

export function whatsappHref(text: string): string {
  return `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(text)}`;
}

export const WA_MENU = [
  {
    key: "it",
    label: "IT services",
    href: whatsappHref(
      "Hello Shefa Venturez — I need help with IT (web, software, cloud or support). Please reply with the next step.",
    ),
  },
  {
    key: "cyber",
    label: "Cybersecurity",
    href: whatsappHref(
      "Hello Shefa Venturez — I would like to discuss authorized cybersecurity work. Please reply with the next step.",
    ),
  },
  {
    key: "academy",
    label: "Academy",
    href: whatsappHref(
      "Hello Shefa Venturez — I want to know about the academy (IT, Cyber, or Forex). Please reply with the next step.",
    ),
  },
  {
    key: "general",
    label: "General question",
    href: whatsappHref("Hello Shefa Venturez — I have a question. Please reply with the next step."),
  },
] as const;

export const WHATSAPP_HREF = WA_MENU[3].href;

export function enrollWhatsapp(school: string): string {
  return whatsappHref(
    `Hello Shefa Venturez — I want to enroll in ${school}. New students enroll every month. Please send payment details on this WhatsApp.`,
  );
}

export function paymentMailto(school?: string): string {
  const subject = school ? `Payment details — ${school}` : "Payment details — academy";
  const body = school
    ? `Hello Shefa Venturez,\n\nI want to enroll in ${school}. Please send payment details to this email.\n`
    : `Hello Shefa Venturez,\n\nI want to enroll. Please send payment details to this email.\n`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}


export const PDF_HREF = "/docs/shefa-forex-free-path.pdf";
export const PDF_ASSET = "forex-starter";
export const PDF_TITLE = "Free Forex Foundation Curriculum";

export const PDF_UNITS = [
  ["0", "Rules of the road"],
  ["1", "What is being exchanged"],
  ["2", "The quote, the spread, the cost"],
  ["3", "Size is the whole game"],
  ["4", "Leverage is borrowed size"],
  ["5", "Orders are instructions"],
  ["6", "Time on a chart"],
  ["7", "Structure without folklore"],
  ["8", "The written plan"],
  ["9", "Risk as money"],
  ["10", "Journal and weekly review"],
  ["11", "Process instead of motivation"],
  ["12", "A calendar, not a crystal ball"],
  ["13", "When you are not ready"],
] as const;

export const IT_SERVICES = [
  { slug: "web", title: "Web development", summary: "Sites and web applications a team can operate, not only launch." },
  { slug: "mobile", title: "Mobile apps", summary: "iOS and Android work with a defined first release." },
  { slug: "software", title: "Custom software", summary: "Build when the process is the business. Buy when it is not." },
  { slug: "cloud", title: "Cloud solutions", summary: "Hosting and cloud design with owners, backups and an exit." },
  { slug: "infra", title: "IT infrastructure", summary: "Networks, servers and the work that keeps them up." },
  { slug: "database", title: "Databases", summary: "Structures other software can depend on." },
  { slug: "api", title: "APIs", summary: "Contracts, auth, versioning and errors — before the first public URL." },
  { slug: "support", title: "IT support", summary: "Ongoing operations after the first release." },
] as const;

export const CYBER_SERVICES = [
  { slug: "pentest", title: "Penetration testing", summary: "Authorized tests with a letter, a window, and a report you can act on." },
  { slug: "vuln", title: "Vulnerability assessment", summary: "A structured look at weakness — not a surprise scan." },
  { slug: "siem", title: "SIEM, SOC and SOAR", summary: "Collect events, staff a response, automate the boring steps." },
  { slug: "edr", title: "EDR / XDR", summary: "Endpoint and extended detection as an operating choice, not a logo." },
  { slug: "ir", title: "Incident response", summary: "Confirm, contain, communicate, preserve evidence." },
  { slug: "cloudsec", title: "Cloud security", summary: "Identity, configuration and who can change what." },
  { slug: "consult", title: "Cybersecurity consulting", summary: "Design before tools. Authorization before tests." },
] as const;

export const SCHOOLS = [
  {
    slug: "it",
    name: "IT Academy",
    amount_usd: 349,
    amount_ugx: 1_300_000,
    duration: "12 weeks",
    summary: "Practical skills to build, operate and support websites, systems and IT work.",
  },
  {
    slug: "cyber",
    name: "Cyber Academy",
    amount_usd: 429,
    amount_ugx: 1_600_000,
    duration: "12 weeks",
    summary: "How assessments, monitoring and response work — and why authorization is non-negotiable.",
  },
  {
    slug: "forex",
    name: "Forex Academy",
    amount_usd: 299,
    amount_ugx: 1_100_000,
    duration: "8 weeks paid",
    summary: "Free foundation first. Paid academy is supervision of a written plan. New students enroll every month. Education only.",
  },
] as const;

export const SOCIAL = {
  x: {
    href: "https://x.com/ShefaVenturez",
    label: "X",
    handle: "@ShefaVenturez",
  },
  facebook: {
    href: "https://www.facebook.com/profile.php?id=61593796601793",
    label: "Facebook",
  },
  telegram: {
    href: "https://t.me/ShefaVenturesFxAcademy",
    label: "Telegram",
    handle: "t.me/ShefaVenturesFxAcademy",
    note: "Free Forex insights — for people learning forex, not for IT or cybersecurity work.",
  },
} as const;

export const PAY_BANK_USD = "Pay by bank · USD";
export const PAY_BANK_UGX = "Pay by bank · UGX";
export const PAY_MOMO = "Mobile money";
export const PAY_BLURB = "Pay by bank (USD or UGX) or Uganda mobile money.";

export const AREA_NOTE = "Serving Uganda and worldwide";
export const INTAKE_NOTE = "New students enroll every month";
export const SITE_URL = "https://www.shefaventurez.com";
export const OG_IMAGE = "/og.jpg";
