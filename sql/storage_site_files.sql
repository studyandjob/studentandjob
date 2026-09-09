-- ============================================================
-- Storage bucket for admin-uploaded PDFs — Notes / Guess Papers —
-- SAFE TO RE-RUN.
-- Isko Supabase SQL Editor mein run karein (kabhi bhi, koi order
-- zaroori nahi — sql/storage_site_images.sql jaisa hi pattern hai).
-- ============================================================

-- 1) Public bucket banayein jahan Notes/Papers ki PDFs upload hongi
insert into storage.buckets (id, name, public)
values ('site-files', 'site-files', true)
on conflict (id) do update set public = true;

-- 2) Public (website visitors) is bucket ki files READ/download kar sakein
drop policy if exists "Public can view site-files" on storage.objects;
create policy "Public can view site-files"
  on storage.objects for select
  using (bucket_id = 'site-files');

-- 3) Sirf logged-in admin upload kar sake
drop policy if exists "Auth can upload site-files" on storage.objects;
create policy "Auth can upload site-files"
  on storage.objects for insert
  with check (bucket_id = 'site-files' and auth.role() = 'authenticated');

-- 4) Sirf logged-in admin update/replace kar sake
drop policy if exists "Auth can update site-files" on storage.objects;
create policy "Auth can update site-files"
  on storage.objects for update
  using (bucket_id = 'site-files' and auth.role() = 'authenticated');

-- 5) Sirf logged-in admin delete kar sake
drop policy if exists "Auth can delete site-files" on storage.objects;
create policy "Auth can delete site-files"
  on storage.objects for delete
  using (bucket_id = 'site-files' and auth.role() = 'authenticated');
