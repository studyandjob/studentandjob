-- ============================================================
-- Staff Accounts + Task Assignment — DB-ENFORCED permissions
-- Run this AFTER sql/schema.sql AND sql/schema_v2_ai_portal.sql
-- (needs the admin_users table + is_admin() function from v2).
-- Safe to re-run.
-- ============================================================
--
-- How this works:
--  - The site owner's own login (already in admin_users) is UNCHANGED —
--    is_admin() still returns true for them, so they keep full access
--    to everything, exactly like before.
--  - A "staff" account is any Supabase Auth user that has a row in
--    staff_users but is NOT in admin_users. Staff accounts can only
--    read/write the 4 content modules (Jobs, Study Zone, Results,
--    Scholarships) they've been explicitly assigned in staff_permissions
--    — enforced by has_module_permission() inside the RLS policies
--    below, not just hidden in the UI. A staff member trying to call the
--    database directly (dev tools, another app, etc.) for a module they
--    weren't assigned is blocked by Postgres itself.
--
-- Setup: staff accounts are created from Admin → Users → Add User in the
-- dashboard (uses a server-side API route + your service role key — see
-- SUPABASE_SERVICE_ROLE_KEY in the README/.env.local.example). You don't
-- need to run any insert statements by hand for this file.

-- ------------------------------------------------------------
-- 1. STAFF DIRECTORY — mirrors just enough of auth.users (name, email)
--    so the admin dashboard can list staff without needing the service
--    role key on every page load.
-- ------------------------------------------------------------
create table if not exists staff_users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  created_at timestamptz default now()
);

alter table staff_users enable row level security;

drop policy if exists "Admin manages staff_users" on staff_users;
create policy "Admin manages staff_users" on staff_users for all
  using (is_admin()) with check (is_admin());

drop policy if exists "Staff can read own row" on staff_users;
create policy "Staff can read own row" on staff_users for select
  using (auth.uid() = id);

-- ------------------------------------------------------------
-- 2. TASK ASSIGNMENT — which of the 4 content modules each staff
--    member can manage. A staff member can have 0, 1, or several.
-- ------------------------------------------------------------
create table if not exists staff_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module text not null check (module in ('jobs', 'studyzone', 'results', 'scholarships')),
  created_at timestamptz default now(),
  unique (user_id, module)
);

alter table staff_permissions enable row level security;

drop policy if exists "Admin manages staff_permissions" on staff_permissions;
create policy "Admin manages staff_permissions" on staff_permissions for all
  using (is_admin()) with check (is_admin());

drop policy if exists "Staff can read own permissions" on staff_permissions;
create policy "Staff can read own permissions" on staff_permissions for select
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 3. has_module_permission() — the actual gate used by every policy
--    below. Full admins (admin_users) always pass, for every module.
--    Staff pass only for modules explicitly assigned to them.
-- ------------------------------------------------------------
create or replace function has_module_permission(module_name text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    is_admin()
    or exists (
      select 1 from staff_permissions
      where user_id = auth.uid() and module = module_name
    );
$$;

-- ------------------------------------------------------------
-- 4. TIGHTEN the 4 content-module tables so staff can only write the
--    module(s) they're assigned. Policy names match the ones already
--    created by earlier sql files, so this simply replaces them.
-- ------------------------------------------------------------
drop policy if exists "Auth can modify jobs_table" on jobs_table;
create policy "Modules can modify jobs_table" on jobs_table for all
  using (has_module_permission('jobs')) with check (has_module_permission('jobs'));

drop policy if exists "Auth can modify students_data" on students_data;
create policy "Modules can modify students_data" on students_data for all
  using (has_module_permission('studyzone')) with check (has_module_permission('studyzone'));

drop policy if exists "Admins can manage study_materials" on study_materials;
create policy "Modules can modify study_materials" on study_materials for all
  using (has_module_permission('studyzone')) with check (has_module_permission('studyzone'));

drop policy if exists "Admins can manage classes" on classes;
create policy "Modules can modify classes" on classes for all
  using (has_module_permission('studyzone')) with check (has_module_permission('studyzone'));

drop policy if exists "Admins can manage subjects" on subjects;
create policy "Modules can modify subjects" on subjects for all
  using (has_module_permission('studyzone')) with check (has_module_permission('studyzone'));

drop policy if exists "Auth can modify results_table" on results_table;
create policy "Modules can modify results_table" on results_table for all
  using (has_module_permission('results')) with check (has_module_permission('results'));

drop policy if exists "Auth can modify scholarships_table" on scholarships_table;
create policy "Modules can modify scholarships_table" on scholarships_table for all
  using (has_module_permission('scholarships')) with check (has_module_permission('scholarships'));

-- ------------------------------------------------------------
-- 5. STORAGE — Study Zone's PDF uploads (site-files bucket, used by
--    Notes + Guess/Old Papers) need the same "studyzone" gate.
-- ------------------------------------------------------------
drop policy if exists "Auth can upload site-files" on storage.objects;
create policy "Studyzone can upload site-files" on storage.objects for insert
  with check (bucket_id = 'site-files' and has_module_permission('studyzone'));

drop policy if exists "Auth can update site-files" on storage.objects;
create policy "Studyzone can update site-files" on storage.objects for update
  using (bucket_id = 'site-files' and has_module_permission('studyzone'));

drop policy if exists "Auth can delete site-files" on storage.objects;
create policy "Studyzone can delete site-files" on storage.objects for delete
  using (bucket_id = 'site-files' and has_module_permission('studyzone'));

-- ============================================================
-- Setup checklist:
--  1. Run sql/schema.sql and sql/schema_v2_ai_portal.sql first, if you
--     haven't already (this file needs is_admin() from v2).
--  2. Run this file in the Supabase SQL editor.
--  3. Add SUPABASE_SERVICE_ROLE_KEY to your environment (Vercel →
--     Project Settings → Environment Variables). Find the key in
--     Supabase → Project Settings → API → service_role (secret).
--     NEVER put this in NEXT_PUBLIC_* — it must stay server-only.
--  4. In the dashboard: Admin → Users → Add User to create staff
--     logins, then Task Assignment to pick what each one can manage.
--  5. Staff log in at yoursite.com/user with the email/password you
--     set for them.
-- ============================================================
