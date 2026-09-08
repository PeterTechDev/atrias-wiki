-- Apply to the content database (DATABASE_URL), not necessarily Supabase Auth.
create table public.wiki_dms (
  user_id uuid primary key,
  created_at timestamptz not null default now()
);
alter table public.wiki_dms enable row level security;
revoke all on public.wiki_dms from public;

-- Reads and writes go through the server, which validates the Supabase identity.
-- Restrictive policies also close any pre-existing permissive Data API policies.
alter table public.entities enable row level security;
create policy "Content requires the wiki server" on public.entities
  as restrictive for all to public using (false) with check (false);
alter table public.entity_relations enable row level security;
create policy "Relations require the wiki server" on public.entity_relations
  as restrictive for all to public using (false) with check (false);
alter table public.knowledge_chunks enable row level security;
create policy "Knowledge requires the wiki server" on public.knowledge_chunks
  as restrictive for all to public using (false) with check (false);
alter table public.ingestion_jobs enable row level security;
create policy "Ingestion requires the wiki server" on public.ingestion_jobs
  as restrictive for all to public using (false) with check (false);
