-- ============================================================
-- Storage bucket for Contact Us photos — SAFE TO RE-RUN
-- Isko Supabase SQL Editor mein run karein (schema.sql ke baad,
-- ya kabhi bhi, koi order nahi).
-- ============================================================

-- 1) Public bucket banayein jahan contact photos upload hongi
insert into storage.buckets (id, name, public)
values ('contact-images', 'contact-images', true)
on conflict (id) do update set public = true;

-- 2) Public (website visitors) is bucket ki images READ kar sakein
--    (taake Contact Us page par photos dikhein)
drop policy if exists "Public can view contact-images" on storage.objects;
create policy "Public can view contact-images"
  on storage.objects for select
  using (bucket_id = 'contact-images');

-- 3) Sirf logged-in admin upload kar sake
drop policy if exists "Auth can upload contact-images" on storage.objects;
create policy "Auth can upload contact-images"
  on storage.objects for insert
  with check (bucket_id = 'contact-images' and auth.role() = 'authenticated');

-- 4) Sirf logged-in admin update/replace kar sake
drop policy if exists "Auth can update contact-images" on storage.objects;
create policy "Auth can update contact-images"
  on storage.objects for update
  using (bucket_id = 'contact-images' and auth.role() = 'authenticated');

-- 5) Sirf logged-in admin delete kar sake
drop policy if exists "Auth can delete contact-images" on storage.objects;
create policy "Auth can delete contact-images"
  on storage.objects for delete
  using (bucket_id = 'contact-images' and auth.role() = 'authenticated');
