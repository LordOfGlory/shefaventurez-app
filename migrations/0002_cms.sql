create table if not exists inquiries (
  id serial primary key,
  kind text not null,
  name text not null,
  email text not null,
  phone text not null default '',
  topic text not null default '',
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists enrollments (
  id serial primary key,
  program text not null,
  name text not null,
  email text not null,
  phone text not null default '',
  notes text not null default '',
  status text not null default 'pending_payment',
  country text not null default '',
  pay_method text not null default '',
  tx_ref text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists programs (
  id serial primary key,
  slug text not null unique,
  name text not null,
  price_label text not null default '',
  duration text not null default '',
  summary text not null default '',
  body text not null default '',
  status text not null default 'published',
  sort_order integer not null default 0,
  amount_usd integer not null default 0,
  amount_ugx integer not null default 0,
  updated_by text
);

create table if not exists settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists payments (
  id serial primary key,
  tx_ref text not null unique,
  enrollment_id integer references enrollments(id) on delete set null,
  program text not null,
  name text not null,
  email text not null,
  phone text not null default '',
  amount_ugx integer not null default 0,
  amount_usd integer not null default 0,
  currency text not null default 'USD',
  method text not null default '',
  status text not null default 'pending',
  vip_sent boolean not null default false,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists articles (
  id serial primary key,
  slug text not null unique,
  title text not null,
  category text not null default '',
  excerpt text not null default '',
  body text not null default '',
  minutes integer not null default 8,
  status text not null default 'published',
  updated_by text,
  updated_at timestamptz not null default now()
);
