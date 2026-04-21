create table public.community_submissions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  url text not null,
  submitter_name text,
  note text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  -- filled in after Claude scores it
  headline text,
  summary text,
  category text,
  score integer,
  score_reason text,
  item_id uuid references public.items(id)
);

alter table public.community_submissions enable row level security;

-- Anyone can submit
create policy "Anyone can submit"
  on public.community_submissions for insert
  with check (true);
