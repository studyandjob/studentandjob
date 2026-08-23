-- Adds social media link columns to site_settings.
-- Safe to re-run: uses IF NOT EXISTS on every column.

alter table site_settings add column if not exists facebook_url text;
alter table site_settings add column if not exists whatsapp_channel_url text;
alter table site_settings add column if not exists instagram_url text;
alter table site_settings add column if not exists youtube_url text;
alter table site_settings add column if not exists tiktok_url text;
alter table site_settings add column if not exists twitter_url text;
alter table site_settings add column if not exists linkedin_url text;

-- No RLS changes needed — site_settings already has a public "select" policy
-- (see schema.sql), so these new columns are readable on the public site
-- the same way site_name / logo_url already are.
