-- ============================================================
-- Text Theme (Admin Dashboard → Site Settings → Text Theme)
-- Run this in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

alter table site_settings add column if not exists text_theme text default 'black';

-- Backfill any existing row(s) that don't have a value yet.
update site_settings set text_theme = 'black' where text_theme is null;
