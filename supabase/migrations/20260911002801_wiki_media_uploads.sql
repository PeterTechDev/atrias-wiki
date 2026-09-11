insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wiki-media', 'wiki-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

-- Wiki contributions are shared; immutable filenames prevent replacing another page's image.
create policy "Members upload wiki media" on storage.objects for insert to authenticated
with check (bucket_id = 'wiki-media' and (storage.foldername(name))[1] = (select auth.uid())::text
  and coalesce((select auth.jwt())->>'is_anonymous', 'false') = 'false');
