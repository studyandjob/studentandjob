-- ============================================================
-- Real Job Verification System — Schema Add-on (v5)
-- Run this AFTER sql/add_job_structured_fields.sql in the Supabase SQL Editor.
-- Safe to re-run (uses IF NOT EXISTS throughout).
--
-- Turns "Verified Job Postings" from a badge with no proof into an
-- actual, dated verification record per job:
--   - verified_on   : the date the admin checked the job against its
--                     official source (website / advertisement)
--   - source_type   : which official source was used to verify it
-- ============================================================

alter table jobs_table add column if not exists verified_on date;
alter table jobs_table add column if not exists source_type text; -- 'Official Website' | 'Advertisement' | 'Both'

comment on column jobs_table.verified_on is 'Date the admin verified this job against its official source. Shown publicly as "Verified On".';
comment on column jobs_table.source_type is 'Which official source the job was verified against — shown publicly as "Source".';

-- Backfill: for jobs that already have an official_website or ad_image_url
-- (i.e. were already treated as "verified" by the old badge), stamp them
-- with their creation date so existing listings don't suddenly lose their
-- verified badge after this migration.
update jobs_table
set verified_on = created_at::date
where verified_on is null
  and (official_website is not null or ad_image_url is not null);

update jobs_table
set source_type = case
  when official_website is not null and ad_image_url is not null then 'Both'
  when official_website is not null then 'Official Website'
  when ad_image_url is not null then 'Advertisement'
end
where source_type is null
  and (official_website is not null or ad_image_url is not null);
