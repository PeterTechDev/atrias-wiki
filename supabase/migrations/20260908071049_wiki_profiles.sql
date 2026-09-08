create schema if not exists private;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 2 and 50),
  avatar text not null default 'mage',
  created_at timestamptz not null default now(),
  constraint valid_avatar check (
    avatar in ('mage', 'knight', 'dragon', 'scribe') or
    starts_with(avatar, 'https://janxtcbtksxrbghuoogd.supabase.co/storage/v1/object/public/avatars/' || id::text || '/')
  )
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
create policy "Wiki identities are public" on public.profiles for select to anon, authenticated using (true);

-- Auth owns private names/email; only display name and avatar are copied publicly.
-- This definer is necessary for the auth.users trigger, including pre-session signup.
create function private.sync_wiki_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is not null and auth.uid() <> new.id then
    raise exception 'Cannot change another user profile';
  end if;
  if char_length(coalesce(new.raw_user_meta_data->>'first_name', '')) > 80
     or char_length(coalesce(new.raw_user_meta_data->>'last_name', '')) > 80 then
    raise exception 'Name exceeds 80 characters';
  end if;
  insert into public.profiles (id, display_name, avatar)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data->>'display_name'), ''), 'Aventureiro'),
    coalesce(nullif(new.raw_user_meta_data->>'avatar', ''), 'mage')
  )
  on conflict (id) do update set display_name = excluded.display_name, avatar = excluded.avatar;
  return new;
end;
$$;
revoke all on function private.sync_wiki_profile() from public, anon, authenticated;
create trigger sync_wiki_profile after insert or update of raw_user_meta_data on auth.users
for each row execute function private.sync_wiki_profile();

insert into public.profiles (id, display_name, avatar)
select id, 'Aventureiro', 'mage' from auth.users;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Users upload their own avatars" on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text
  and coalesce((select auth.jwt())->>'is_anonymous', 'false') = 'false');
create policy "Users inspect their own avatars" on storage.objects for select to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users delete their own avatars" on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
