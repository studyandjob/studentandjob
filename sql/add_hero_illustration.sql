-- Adds an admin-uploadable hero illustration image on top of the built-in
-- SVG illustration in components/Hero.jsx. Run this in Supabase → SQL
-- Editor (safe to re-run, uses if not exists).
--
-- When hero_illustration_url is empty/null, the homepage keeps showing the
-- built-in vector illustration automatically — nothing breaks for sites
-- that don't set this.

alter table site_settings
  add column if not exists hero_illustration_url text;
