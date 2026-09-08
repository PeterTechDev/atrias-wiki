alter table public.entities add column if not exists archived_at timestamptz;
create index if not exists entities_archived_at_idx on public.entities (archived_at);
