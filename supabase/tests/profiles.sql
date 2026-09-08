-- Run with `supabase db query --linked -f supabase/tests/profiles.sql`.
-- All fixtures are rolled back; no emails are sent.
begin;
insert into auth.users (id, raw_user_meta_data) values
  ('00000000-0000-4000-8000-000000000001', '{"first_name":"Ana","last_name":"Teste","display_name":"Cronista Ana","avatar":"dragon"}'),
  ('00000000-0000-4000-8000-000000000002', '{"display_name":"Outro cronista"}');
do $$ begin
  assert (select display_name = 'Cronista Ana' and avatar = 'dragon' from public.profiles where id = '00000000-0000-4000-8000-000000000001'), 'Signup must create public identity';
  assert not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name in ('email', 'first_name', 'last_name')), 'Private identity must not be public';
end $$;
do $$ begin
  begin
    update auth.users set raw_user_meta_data = '{"display_name":{"invalid":true}}' where id = '00000000-0000-4000-8000-000000000001';
    raise exception 'Malformed metadata was allowed';
  exception when raise_exception then
    if sqlerrm <> 'Profile fields must be strings' then raise; end if;
  end;
  begin
    update auth.users set raw_user_meta_data = '{"display_name":"Valid name","avatar":"https://example.com/tracker.png"}' where id = '00000000-0000-4000-8000-000000000001';
    raise exception 'Untrusted avatar URL was allowed';
  exception when check_violation then null;
  end;
end $$;
update auth.users set raw_user_meta_data = raw_user_meta_data || '{"display_name":"Ana Editora"}' where id = '00000000-0000-4000-8000-000000000001';
do $$ begin
  assert (select display_name = 'Ana Editora' from public.profiles where id = '00000000-0000-4000-8000-000000000001'), 'Profile updates must sync';
end $$;
set local role anon;
do $$ begin
  assert (select count(*) >= 2 from public.profiles), 'Readers must see attribution';
  begin
    update public.profiles set display_name = 'Forged';
    raise exception 'Anonymous profile mutation was allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":false}', true);
set local role authenticated;
do $$ begin
  begin
    update public.profiles set display_name = 'Forged' where id = '00000000-0000-4000-8000-000000000002';
    raise exception 'Other user profile mutation was allowed';
  exception when insufficient_privilege then null;
  end;
  insert into storage.objects (bucket_id, name) values ('avatars', '00000000-0000-4000-8000-000000000001/check.png');
  begin
    insert into storage.objects (bucket_id, name) values ('avatars', '00000000-0000-4000-8000-000000000002/check.png');
    raise exception 'Other user avatar upload was allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
