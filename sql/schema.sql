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

-- 5. RESULTS
create table if not exists results_table (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  board_or_department text,
  result_date date,
  result_link text,
  created_at timestamptz default now()
);

-- 6. SCHOLARSHIPS
create table if not exists scholarships_table (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  provider text,
  deadline date,
  apply_link text,
  created_at timestamptz default now()
);

-- 7. CONTACT MESSAGES (submitted from the public Contact Us page)
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz default now()
);

-- Safe for existing databases too: adds the read/unread flag if the table
-- was created before this column existed.
alter table contact_messages add column if not exists is_read boolean not null default false;

-- 8. SITE PAGES (editable static content — About Us, Privacy Policy, etc.)
create table if not exists site_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  content text default '',
  updated_at timestamptz default now()
);

-- 9. SITE CONTACTS (contact persons shown as cards on the public Contact Us
-- page — name, designation, photo, phone, email. Managed from the admin
-- dashboard's "Contact Us" menu.)
create table if not exists site_contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  designation text,
  image_url text,
  contact_no text,
  email text,
  display_order int not null default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- Public (anon) can READ everything except contact messages.
-- Public can INSERT contact messages (submit the contact form) but not read/edit them.
-- Only authenticated admin users can INSERT/UPDATE/DELETE elsewhere.
-- ============================================================

alter table site_settings     enable row level security;
alter table hero_slides       enable row level security;
alter table jobs_table        enable row level security;
alter table students_data     enable row level security;
alter table results_table     enable row level security;
alter table scholarships_table enable row level security;
alter table contact_messages  enable row level security;
alter table site_pages        enable row level security;
alter table site_contacts     enable row level security;

-- Public read access
create policy "Public can read site_settings"    on site_settings     for select using (true);
create policy "Public can read hero_slides"      on hero_slides       for select using (true);
create policy "Public can read jobs_table"       on jobs_table        for select using (true);
create policy "Public can read students_data"    on students_data     for select using (true);
create policy "Public can read results_table"    on results_table     for select using (true);
create policy "Public can read scholarships_table" on scholarships_table for select using (true);
create policy "Public can read site_pages"       on site_pages        for select using (true);
create policy "Public can read site_contacts"    on site_contacts     for select using (true);

-- Public can submit a contact message, but cannot read/update/delete any
create policy "Public can insert contact_messages" on contact_messages for insert with check (true);

-- Authenticated write access (admin logs in via Supabase Auth)
create policy "Auth can modify site_settings" on site_settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Auth can modify hero_slides" on hero_slides for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Auth can modify jobs_table" on jobs_table for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Auth can modify students_data" on students_data for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Auth can modify results_table" on results_table for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Auth can modify scholarships_table" on scholarships_table for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Auth can manage contact_messages" on contact_messages for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Auth can modify site_pages" on site_pages for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Auth can modify site_contacts" on site_contacts for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Seed one settings row so the site has something to render on first load
insert into site_settings (site_name, main_heading, sub_heading, scrolling_news)
values ('My Education & Job Portal', 'Find Your Next Government Job', 'Latest jobs, results, notes & scholarships in one place', 'Welcome! New jobs and notes are updated daily.')
on conflict do nothing;

-- Seed the four static content pages so the admin dashboard has rows to edit
insert into site_pages (slug, title, content) values
  ('about-us', 'About Us', 'Write something about your organization here. You can edit this anytime from the Admin Dashboard → Pages.'),
  ('privacy-policy', 'Privacy Policy', 'Write your privacy policy here. You can edit this anytime from the Admin Dashboard → Pages.'),
  ('disclaimer', 'Disclaimer', 'Write your disclaimer here. You can edit this anytime from the Admin Dashboard → Pages.'),
  ('terms-and-conditions', 'Terms & Conditions', 'Write your terms and conditions here. You can edit this anytime from the Admin Dashboard → Pages.')
on conflict (slug) do nothing;
