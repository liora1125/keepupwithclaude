-- Items table: stores all curated content from the pipeline
create table public.items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  source text not null,
  source_url text not null,
  original_title text,
  headline text,
  summary text,
  category text check (category in ('update', 'workflow', 'tool', 'tip', 'research', 'community')),
  score integer check (score between 1 and 10),
  score_reason text,
  published_at timestamptz,
  manually_hidden boolean default false,
  content_date timestamptz,
  image_url text,

  unique(source_url)
);

-- Indexes for common queries
create index on public.items (published_at desc);
create index on public.items (category);
create index on public.items (score desc);
create index on public.items (manually_hidden);

-- Row-level security: only published, non-hidden items are readable by the public
alter table public.items enable row level security;

create policy "Published items are publicly readable"
  on public.items for select
  using (
    published_at is not null
    and published_at <= now()
    and manually_hidden = false
  );

-- Newsletter subscribers
create table public.subscribers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  email text not null unique,
  confirmed boolean default false
);

alter table public.subscribers enable row level security;

create policy "Anyone can subscribe"
  on public.subscribers for insert
  with check (true);
