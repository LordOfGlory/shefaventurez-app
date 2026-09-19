create table if not exists downloads (
  id serial primary key,
  asset text not null default 'forex-starter',
  name text not null,
  email text not null,
  source text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists downloads_created_at_idx on downloads (created_at desc);
create index if not exists downloads_email_idx on downloads (email);
