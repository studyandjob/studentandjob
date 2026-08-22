-- ============================================================
-- AI-Powered Job & Education Portal — Schema Add-on (v2)
-- Run this AFTER sql/schema.sql in the Supabase SQL Editor.
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE throughout).
-- ============================================================

-- ------------------------------------------------------------
-- 0. ADMIN ROLE TABLE
-- ------------------------------------------------------------
-- Once candidates get their own Supabase Auth accounts (VIP portal
-- sign-up), "any authenticated user" can no longer mean "the admin".
-- This table + is_admin() function is how every admin-only policy
-- below (and the original schema.sql policies, patched at the end
-- of this file) tells admins apart from ordinary candidates.
--
-- After creating your admin login user in Supabase Auth, add their
-- UID here, e.g.:
--   insert into admin_users (user_id) values ('paste-uid-here');
create table if not exists admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table admin_users enable row level security;

drop policy if exists "Users can check own admin row" on admin_users;
create policy "Users can check own admin row" on admin_users
  for select using (auth.uid() = user_id);

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from admin_users where user_id = auth.uid());
$$;

-- ------------------------------------------------------------
-- 1. JOBS TABLE — extend with the Add Job form fields
-- ------------------------------------------------------------
alter table jobs_table add column if not exists sector text;                 -- Federal / Punjab / Sindh / Balochistan / KPK / Azad Kashmir
alter table jobs_table add column if not exists job_type text default 'Government'; -- 'Government' | 'Private'
alter table jobs_table add column if not exists category text;               -- e.g. Teaching, Clerical, Medical, IT
alter table jobs_table add column if not exists city text;
alter table jobs_table add column if not exists application_mode text default 'Online'; -- 'Online' | 'Manual/By Post'
alter table jobs_table add column if not exists ad_image_url text;           -- ad image or PDF URL
alter table jobs_table add column if not exists postal_address text;         -- shown when application_mode = 'Manual/By Post'
alter table jobs_table add column if not exists required_documents text;     -- checklist, one item per line
alter table jobs_table add column if not exists fee_details text;            -- challan / fee instructions
alter table jobs_table add column if not exists education_required text[] default '{}'; -- multi-select, used by AI matching
alter table jobs_table add column if not exists skills_required text[] default '{}';    -- multi-select, used by AI matching
alter table jobs_table add column if not exists whatsapp_number text;        -- inquiry button on the job card
alter table jobs_table add column if not exists status text default 'active'; -- 'active' | 'closed'

create index if not exists idx_jobs_sector on jobs_table (sector);
create index if not exists idx_jobs_type on jobs_table (job_type);
create index if not exists idx_jobs_status on jobs_table (status);
create index if not exists idx_jobs_education_required on jobs_table using gin (education_required);
create index if not exists idx_jobs_skills_required on jobs_table using gin (skills_required);

-- ------------------------------------------------------------
-- 2. CANDIDATE PROFILES — the VIP student profile builder
-- ------------------------------------------------------------
create table if not exists candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,

  -- Personal info
  full_name text,
  father_name text,
  cnic text,
  dob date,
  gender text,
  phone text,
  whatsapp text,
  email text,
  city text,
  address text,
  sector_preference text,
  photo_url text,
  summary text, -- short "objective" paragraph shown on the CV

  -- Education (structured — used by the CV and by AI matching)
  -- education: [{ "level": "Bachelor (BS - 4 Year)", "degree": "BSCS", "institute": "...", "year": "2023", "marks": "3.4 CGPA" }, ...]
  education jsonb not null default '[]',
  education_levels text[] not null default '{}', -- flattened list of `level` values, kept in sync for fast matching

  -- Skills (multi-select tags — same list used on the Add Job form)
  skills text[] not null default '{}',

  -- Experience
  -- experience: [{ "title": "...", "organization": "...", "duration": "...", "description": "..." }, ...]
  experience jsonb not null default '[]',

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_candidate_user on candidate_profiles (user_id);
create index if not exists idx_candidate_education_levels on candidate_profiles using gin (education_levels);
create index if not exists idx_candidate_skills on candidate_profiles using gin (skills);

alter table candidate_profiles enable row level security;

drop policy if exists "Candidate manages own profile" on candidate_profiles;
create policy "Candidate manages own profile" on candidate_profiles for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Admin manages all profiles" on candidate_profiles;
create policy "Admin manages all profiles" on candidate_profiles for all
  using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- 3. MEMBER REQUESTS — VIP membership / billing
-- ------------------------------------------------------------
create table if not exists member_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  candidate_id uuid references candidate_profiles(id) on delete set null,

  plan text not null default '1 Month',        -- '1 Month' | '3 Months' | '1 Year' etc.
  amount numeric(10, 2),
  payment_method text,                          -- 'Easypaisa', 'JazzCash', 'Bank Transfer', ...
  payment_proof_url text,                        -- screenshot / receipt image
  whatsapp text,

  status text not null default 'pending',       -- 'pending' | 'active' | 'expired' | 'rejected'
  start_date date,
  end_date date,
  admin_note text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_member_requests_user on member_requests (user_id);
create index if not exists idx_member_requests_status on member_requests (status);

alter table member_requests enable row level security;

-- Candidates can create a request and see only their own — they cannot
-- flip themselves to 'active', only admins (via the admin policy) can.
drop policy if exists "Candidate can insert own request" on member_requests;
create policy "Candidate can insert own request" on member_requests for insert
  with check (auth.uid() = user_id);

drop policy if exists "Candidate can read own requests" on member_requests;
create policy "Candidate can read own requests" on member_requests for select
  using (auth.uid() = user_id);

drop policy if exists "Admin manages all member requests" on member_requests;
create policy "Admin manages all member requests" on member_requests for all
  using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- 4. BILLING AUTOMATION — auto-expire memberships
-- ------------------------------------------------------------
-- Flips any 'active' membership whose end_date has passed to 'expired'.
-- Called automatically by the admin dashboard every time the "Member
-- Requests" tab loads (see MembersManager.jsx), so no extra setup is
-- required. If your Supabase project has the pg_cron extension enabled
-- you can additionally schedule it to run daily — see the commented
-- block below.
create or replace function sync_expired_members()
returns void
language sql
security definer
set search_path = public
as $$
  update member_requests
  set status = 'expired', updated_at = now()
  where status = 'active'
    and end_date is not null
    and end_date < current_date;
$$;

-- Optional: run automatically once a day without any client call.
-- Requires the pg_cron extension (Database -> Extensions -> pg_cron).
-- select cron.schedule('sync-expired-members', '0 0 * * *', 'select sync_expired_members();');

-- ------------------------------------------------------------
-- 5. PATCH ORIGINAL schema.sql POLICIES to use is_admin()
-- ------------------------------------------------------------
-- The original policies granted write access to ANY authenticated
-- user. Now that candidates authenticate too, tighten those to
-- admins only.
drop policy if exists "Auth can modify site_settings" on site_settings;
create policy "Auth can modify site_settings" on site_settings for all
  using (is_admin()) with check (is_admin());

drop policy if exists "Auth can modify hero_slides" on hero_slides;
create policy "Auth can modify hero_slides" on hero_slides for all
  using (is_admin()) with check (is_admin());

drop policy if exists "Auth can modify jobs_table" on jobs_table;
create policy "Auth can modify jobs_table" on jobs_table for all
  using (is_admin()) with check (is_admin());

drop policy if exists "Auth can modify students_data" on students_data;
create policy "Auth can modify students_data" on students_data for all
  using (is_admin()) with check (is_admin());

drop policy if exists "Auth can modify results_table" on results_table;
create policy "Auth can modify results_table" on results_table for all
  using (is_admin()) with check (is_admin());

drop policy if exists "Auth can modify scholarships_table" on scholarships_table;
create policy "Auth can modify scholarships_table" on scholarships_table for all
  using (is_admin()) with check (is_admin());

drop policy if exists "Auth can manage contact_messages" on contact_messages;
create policy "Auth can manage contact_messages" on contact_messages for all
  using (is_admin()) with check (is_admin());

drop policy if exists "Auth can modify site_pages" on site_pages;
create policy "Auth can modify site_pages" on site_pages for all
  using (is_admin()) with check (is_admin());

drop policy if exists "Auth can modify site_contacts" on site_contacts;
create policy "Auth can modify site_contacts" on site_contacts for all
  using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- 6. STORAGE — payment proof / CV photo uploads (candidate-owned)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('vip_uploads', 'vip_uploads', true)
on conflict (id) do nothing;

drop policy if exists "Public can view vip_uploads" on storage.objects;
create policy "Public can view vip_uploads" on storage.objects for select
  using (bucket_id = 'vip_uploads');

drop policy if exists "Authenticated can upload vip_uploads" on storage.objects;
create policy "Authenticated can upload vip_uploads" on storage.objects for insert
  with check (bucket_id = 'vip_uploads' and auth.role() = 'authenticated');

-- ============================================================
-- Setup checklist:
--  1. Run this file in the Supabase SQL editor.
--  2. Create your admin login (Authentication -> Users -> Add user).
--  3. insert into admin_users (user_id) values ('<that user's UID>');
--  4. Candidates sign themselves up from /vip (Supabase Auth,
--     email + password) — no admin_users row, so RLS keeps them
--     scoped to their own profile/requests automatically.
-- ============================================================
