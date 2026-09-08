-- ============================================================
-- Show Apply Button toggle — Schema Add-on
-- Run this in the Supabase SQL Editor.
-- Safe to re-run (uses IF NOT EXISTS).
--
-- Lets the admin control, per job, whether the public "Apply Now"
-- button appears next to "View Details":
--   - show_apply_button = true  -> Apply Now + View Details both shown
--   - show_apply_button = false -> only View Details is shown
--
-- Defaults to true so existing jobs that already have an apply_link
-- keep behaving exactly as before this migration.
-- ============================================================

alter table jobs_table add column if not exists show_apply_button boolean not null default true;

comment on column jobs_table.show_apply_button is
  'When true (and apply_link is set), the public Apply Now button is shown alongside View Details. When false, only View Details is shown.';
