create table if not exists public.entity_favorites (
  user_id uuid not null,
  entity_id uuid not null references public.entities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, entity_id)
);
create index if not exists entity_favorites_user_created_idx on public.entity_favorites (user_id, created_at desc);

-- Only the trusted server connection accesses favorites; no Data API policies.
alter table public.entity_favorites enable row level security;
