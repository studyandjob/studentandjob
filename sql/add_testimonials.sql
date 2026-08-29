-- Testimonials shown in the homepage "Success Stories" section.
-- Run this once in the Supabase SQL editor.

create table if not exists testimonials_table (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,                 -- e.g. "Selected — Junior Clerk, PPSC" or "FSc Student"
  quote text not null,
  rating smallint default 5, -- 1-5 stars, optional
  avatar_url text,
  display_order int default 0,
  created_at timestamptz default now()
);

alter table testimonials_table enable row level security;

drop policy if exists "Public can read testimonials_table" on testimonials_table;
create policy "Public can read testimonials_table"
  on testimonials_table for select using (true);

-- Admins (service role / authenticated in your admin dashboard) manage rows
-- the same way other tables in this project are managed — no extra policy
-- needed if the admin panel already uses the service role key.
