create table public.follows (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text not null,
  handle text,
  description text not null,
  url text not null,
  type text check (type in ('x', 'newsletter', 'youtube')) not null,
  active boolean default true,
  sort_order integer default 0
);

alter table public.follows enable row level security;

create policy "Follows are publicly readable"
  on public.follows for select
  using (active = true);

-- Seed with existing hardcoded data
insert into public.follows (name, handle, description, url, type, sort_order) values
  ('Anthropic', '@AnthropicAI', 'Official Anthropic account — model releases, research, and announcements.', 'https://x.com/AnthropicAI', 'x', 1),
  ('Dario Amodei', '@DarioAmodei', 'Anthropic CEO. Posts on AI safety, Claude capabilities, and the future of AI.', 'https://x.com/DarioAmodei', 'x', 2),
  ('Alex Albert', '@alexalbert__', 'Head of Developer Relations at Anthropic. Shares Claude tips and real prompts.', 'https://x.com/alexalbert__', 'x', 3),
  ('Simon Willison', '@simonw', 'Prolific builder. Regularly publishes deep dives on Claude and AI tools.', 'https://x.com/simonw', 'x', 4),
  ('swyx', '@swyx', 'AI engineer and writer. Covers the Claude ecosystem and practical AI workflows.', 'https://x.com/swyx', 'x', 5),
  ('Ben''s Bites', null, 'Daily AI news digest — consistently the fastest signal on Claude updates.', 'https://www.bensbites.com', 'newsletter', 6),
  ('TLDR AI', null, '5-minute daily roundup of AI news including Anthropic announcements.', 'https://tldr.tech/ai', 'newsletter', 7),
  ('The Rundown AI', null, 'Practical AI newsletter with step-by-step Claude tutorials and use cases.', 'https://www.therundown.ai', 'newsletter', 8),
  ('Matt Wolfe', null, 'Covers every major Claude release and compares models in plain English.', 'https://www.youtube.com/@mreflow', 'youtube', 9);
