create table sources (
  id uuid primary key default gen_random_uuid(),
  url text not null unique,
  name text not null,
  kind text not null check (kind in ('rss','scrape')),
  category text not null default 'unsorted',
  last_checked timestamptz,
  last_hash text,
  active boolean default true
);

create table entries (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references sources(id),
  original_url text,
  original_title text,
  published_at timestamptz,
  raw_content text,
  distilled_title text,
  distilled_body text,
  category text,
  created_at timestamptz default now(),
  read boolean default false
);
