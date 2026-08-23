-- Adds the column that stores the site-wide active theme, picked from the
-- Admin Dashboard's "Theme Settings" tab (components/admin/ThemeSettingsManager.jsx).
-- Safe to re-run: `if not exists` makes this a no-op on a database that
-- already has the column.
alter table site_settings
  add column if not exists active_theme text default 'classic-royal-blue';
