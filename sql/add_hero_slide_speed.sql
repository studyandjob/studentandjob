-- Adds the column that stores the home-page hero slider's auto-play speed,
-- picked from the Admin Dashboard's "Website Settings" tab
-- (components/admin/SettingsForm.jsx) as 1x / 2x / 3x / 4x.
-- Safe to re-run: `if not exists` makes this a no-op on a database that
-- already has the column.
alter table site_settings
  add column if not exists hero_slide_speed text default '1x';
