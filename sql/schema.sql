-- ============================================================
-- Educational & Job Portal — Supabase Schema
-- Run this in the Supabase SQL editor (Project > SQL Editor)
-- ============================================================

-- 1. SITE SETTINGS (single row config table)
create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default 'My Portal',
  logo_url text,
  main_heading text default 'Welcome to Our Portal',
  sub_heading text default 'Your gateway to jobs and education',
  scrolling_news text default 'Welcome to our website!',
  updated_at timestamptz default now()
);

-- 2. HERO SLIDES
create table if not exists hero_slides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  link_url text,
  display_order int not null default 0,
  created_at timestamptz default now()
);

-- 3. JOBS
create table if not exists jobs_table (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text,
  last_date date,
  apply_link text,
  created_at timestamptz default now()
);

-- 4. STUDENTS DATA (notes / guess papers / PDFs)
create table if not exists students_data (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  file_url text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- Public (anon) can READ everything.
-- Only authenticated admin users can INSERT/UPDATE/DELETE.
-- ============================================================

alter table site_settings enable row level security;
alter table hero_slides   enable row level security;
alter table jobs_table    enable row level security;
alter table students_data enable row level security;

-- Public read access
create policy "Public can read site_settings" on site_settings for select using (true);
create policy "Public can read hero_slides"   on hero_slides   for select using (true);
create policy "Public can read jobs_table"    on jobs_table    for select using (true);
create policy "Public can read students_data" on students_data for select using (true);

-- Authenticated write access (admin logs in via Supabase Auth)
create policy "Auth can modify site_settings" on site_settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Auth can modify hero_slides" on hero_slides for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Auth can modify jobs_table" on jobs_table for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Auth can modify students_data" on students_data for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Seed one settings row so the site has something to render on first load
insert into site_settings (site_name, main_heading, sub_heading, scrolling_news)
values ('My Education & Job Portal', 'Find Your Next Government Job', 'Latest jobs, results, notes & scholarships in one place', 'Welcome! New jobs and notes are updated daily.')
on conflict do nothing;
