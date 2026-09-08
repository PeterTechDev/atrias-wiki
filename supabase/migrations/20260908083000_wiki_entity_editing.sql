-- entities historically used timestamp without time zone. Existing values were
-- written by PostgreSQL in UTC; this preserves that instant as timestamptz.
alter table public.entities
  alter column created_at type timestamptz using created_at at time zone 'UTC',
  alter column updated_at type timestamptz using updated_at at time zone 'UTC';

alter table public.entities
  add column if not exists updated_by uuid,
  add column if not exists updated_by_source text not null default 'legacy',
  add column if not exists revision integer not null default 1;

alter table public.entities
  add constraint entities_updated_by_source_check
  check (updated_by_source in ('legacy', 'admin', 'member'));

alter table public.entities
  add constraint entities_revision_check check (revision > 0);
