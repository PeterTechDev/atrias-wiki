create or replace function private.sync_wiki_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  field_name text;
begin
  if auth.uid() is not null and auth.uid() <> new.id then
    raise exception 'Cannot change another user profile';
  end if;
  foreach field_name in array array['first_name', 'last_name', 'display_name', 'avatar'] loop
    if new.raw_user_meta_data ? field_name
       and jsonb_typeof(new.raw_user_meta_data->field_name) <> 'string' then
      raise exception 'Profile fields must be strings';
    end if;
  end loop;
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
