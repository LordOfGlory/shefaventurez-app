-- Staff CMS: editable pages + services, and I&M Bank receiving rails.
-- Account numbers stay empty until staff fill them in the dashboard.

create table if not exists site_pages (
  id serial primary key,
  slug text not null unique,
  title text not null,
  eyebrow text not null default '',
  heading text not null default '',
  lede text not null default '',
  body text not null default '',
  cta_label text not null default '',
  cta_href text not null default '',
  hero_image text not null default '',
  status text not null default 'published',
  updated_by text,
  updated_at timestamptz not null default now()
);

create table if not exists services (
  id serial primary key,
  slug text not null unique,
  kind text not null,
  title text not null,
  summary text not null default '',
  body text not null default '',
  status text not null default 'published',
  sort_order integer not null default 0,
  updated_by text,
  updated_at timestamptz not null default now()
);

create index if not exists services_kind_idx on services (kind, sort_order);
create index if not exists site_pages_status_idx on site_pages (status);

insert into settings (key, value) values
  ('bank_name', 'I&M Bank'),
  ('bank_account_name', 'Shefa Venturez'),
  ('bank_usd_account', ''),
  ('bank_ugx_account', ''),
  ('bank_branch', ''),
  ('bank_swift', '')
on conflict (key) do nothing;

insert into site_pages (slug, title, eyebrow, heading, lede, body, cta_label, cta_href, hero_image, status) values
(
  'home',
  'Shefa Venturez | Build. Secure. Learn.',
  'Technology · Cybersecurity · Academy',
  'Build. Secure. Learn.',
  'We create technology, protect it with written permission, and train the people who run both.',
  '',
  'Talk to us',
  '/consultation',
  '/img/office-team.jpg',
  'published'
),
(
  'about',
  'About | Shefa Venturez',
  'Company',
  'A technology company that also teaches.',
  '',
  $b$Shefa Venturez exists to do three things well. We build software and infrastructure. We protect systems only with written permission. We train people — one academy at a time.

We do not invent clients, awards or pass rates. Trust is how we are allowed to work: written scope, authorized security, and no profit theatre in forex education.

Official contact is shefaventurez@outlook.com and WhatsApp +256 763 533 786.$b$,
  'Request a consultation',
  '/consultation',
  '/img/meeting.jpg',
  'published'
),
(
  'contact',
  'Contact | Shefa Venturez',
  'Contact',
  'Write to us.',
  'shefaventurez@outlook.com · WhatsApp +256 763 533 786',
  $b$Uganda WhatsApp +256 763 533 786. Organisations and students in Uganda and worldwide. Academy fees are paid to Shefa Venturez I&M Bank accounts (USD or UGX) or Uganda MTN / Airtel mobile money.

Do not pay anyone who is not using those channels. We reply within one business day.$b$,
  '',
  '',
  '',
  'published'
),
(
  'consultation',
  'Consultation | Shefa Venturez',
  'Consultation',
  'Tell us what you need built or protected.',
  'Share enough context for a written next step. Security testing is not requested by this form alone — authorization is a separate letter.',
  'We reply from shefaventurez@outlook.com within one business day. For a faster reply, WhatsApp +256 763 533 786.',
  'Message WhatsApp',
  '',
  '',
  'published'
),
(
  'it-services',
  'IT Services | Shefa Venturez',
  'IT Services',
  'Software and infrastructure that can be operated.',
  'Every engagement starts with a written scope.',
  '',
  '',
  '',
  '/img/code.jpg',
  'published'
),
(
  'cybersecurity',
  'Cybersecurity | Shefa Venturez',
  'Cybersecurity',
  'Authorized and defensive. Always.',
  'Testing starts only with written permission and a defined scope.',
  '',
  '',
  '',
  '/img/cyber-pro.jpg',
  'published'
),
(
  'academy',
  'Academy | Shefa Venturez',
  'Academy',
  'One education brand. Three schools.',
  'New students enroll every month. You join one path. A place is confirmed only after full payment.',
  '',
  '',
  '',
  '/img/academy-africa.jpg',
  'published'
),
(
  'enroll',
  'Enroll | Shefa Venturez',
  'Academy',
  'Pay for one school',
  'New students enroll every month. Tuition is in US dollars. Pay to Shefa Venturez I&M Bank accounts (USD worldwide, UGX in Uganda) or Uganda MTN / Airtel. A place is confirmed only after we see the payment.',
  '',
  '',
  '',
  '',
  'published'
),
(
  'resources',
  'Resources | Shefa Venturez',
  'Resources',
  'Practical writing you can use this week.',
  '',
  '',
  '',
  '',
  '',
  'published'
),
(
  'download',
  'Free Forex Foundation Curriculum | Shefa Venturez',
  'Free curriculum',
  'Forex Foundation PDF',
  'A study path for people who want to understand markets, cost, size, charts, plans and risk before they pay for supervision.',
  '',
  '',
  '',
  '',
  'published'
)
on conflict (slug) do nothing;

insert into services (slug, kind, title, summary, body, sort_order, status) values
  ('web', 'it', 'Web development', 'Sites and web applications a team can operate, not only launch.', 'Work starts with a written scope: what is in, what is out, who owns it, and what the first release is allowed to be.', 0, 'published'),
  ('mobile', 'it', 'Mobile apps', 'iOS and Android work with a defined first release.', 'Work starts with a written scope: what is in, what is out, who owns it, and what the first release is allowed to be.', 1, 'published'),
  ('software', 'it', 'Custom software', 'Build when the process is the business. Buy when it is not.', 'Work starts with a written scope: what is in, what is out, who owns it, and what the first release is allowed to be.', 2, 'published'),
  ('cloud', 'it', 'Cloud solutions', 'Hosting and cloud design with owners, backups and an exit.', 'Work starts with a written scope: what is in, what is out, who owns it, and what the first release is allowed to be.', 3, 'published'),
  ('infra', 'it', 'IT infrastructure', 'Networks, servers and the work that keeps them up.', 'Work starts with a written scope: what is in, what is out, who owns it, and what the first release is allowed to be.', 4, 'published'),
  ('database', 'it', 'Databases', 'Structures other software can depend on.', 'Work starts with a written scope: what is in, what is out, who owns it, and what the first release is allowed to be.', 5, 'published'),
  ('api', 'it', 'APIs', 'Contracts, auth, versioning and errors — before the first public URL.', 'Work starts with a written scope: what is in, what is out, who owns it, and what the first release is allowed to be.', 6, 'published'),
  ('support', 'it', 'IT support', 'Ongoing operations after the first release.', 'Work starts with a written scope: what is in, what is out, who owns it, and what the first release is allowed to be.', 7, 'published'),
  ('pentest', 'cyber', 'Penetration testing', 'Authorized tests with a letter, a window, and a report you can act on.', 'No testing without explicit written permission.', 0, 'published'),
  ('vuln', 'cyber', 'Vulnerability assessment', 'A structured look at weakness — not a surprise scan.', 'No testing without explicit written permission.', 1, 'published'),
  ('siem', 'cyber', 'SIEM, SOC and SOAR', 'Collect events, staff a response, automate the boring steps.', 'No testing without explicit written permission.', 2, 'published'),
  ('edr', 'cyber', 'EDR / XDR', 'Endpoint and extended detection as an operating choice, not a logo.', 'No testing without explicit written permission.', 3, 'published'),
  ('ir', 'cyber', 'Incident response', 'Confirm, contain, communicate, preserve evidence.', 'No testing without explicit written permission.', 4, 'published'),
  ('cloudsec', 'cyber', 'Cloud security', 'Identity, configuration and who can change what.', 'No testing without explicit written permission.', 5, 'published'),
  ('consult', 'cyber', 'Cybersecurity consulting', 'Design before tools. Authorization before tests.', 'No testing without explicit written permission.', 6, 'published')
on conflict (slug) do nothing;

update programs
  set body = 'New students enroll every month. One academy at a time. A place is confirmed after we see the payment on I&M Bank or Uganda mobile money.'
  where body = '';
