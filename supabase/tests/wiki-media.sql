begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":false}', true);
insert into storage.objects (bucket_id, name) values ('wiki-media', '00000000-0000-4000-8000-000000000001/rls-check.png');
do $$ begin
  begin
    insert into storage.objects (bucket_id, name) values ('wiki-media', '00000000-0000-4000-8000-000000000002/rls-check.png');
    raise exception 'Cross-user upload was allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":true}', true);
do $$ begin
  begin
    insert into storage.objects (bucket_id, name) values ('wiki-media', '00000000-0000-4000-8000-000000000001/anonymous-check.png');
    raise exception 'Anonymous upload was allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
