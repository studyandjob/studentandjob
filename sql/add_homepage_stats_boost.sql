-- ============================================================
-- Homepage Stats — Admin-Controlled Boost Numbers (v5)
-- Run this AFTER sql/add_job_structured_fields.sql in the Supabase SQL Editor.
-- Safe to re-run (uses IF NOT EXISTS throughout).
--
-- Problem this solves:
--   Early on, the homepage stats strip shows the raw live row counts
--   ("9+ Jobs Posted", "0 Notes & Papers", "1+ Scholarships"), which
--   looks unfinished/unprofessional on a new site.
--
-- Fix:
--   1. Each stat now displays (live count + admin boost). Admin can set
--      a starting boost per category from Admin → Website Settings, e.g.
--      boost Jobs by 40 so "9 live + 40 boost = 49+ Jobs Posted".
--   2. Any category whose FINAL total (live + boost) is still 0 is
--      hidden from the strip entirely, instead of showing "0 ...".
-- ============================================================

alter table site_settings add column if not exists stats_jobs_boost integer not null default 0;
alter table site_settings add column if not exists stats_notes_boost integer not null default 0;
alter table site_settings add column if not exists stats_scholarships_boost integer not null default 0;
alter table site_settings add column if not exists stats_results_boost integer not null default 0;

comment on column site_settings.stats_jobs_boost is 'Added on top of the live jobs_table count on the homepage Stats strip.';
comment on column site_settings.stats_notes_boost is 'Added on top of the live students_data count on the homepage Stats strip.';
comment on column site_settings.stats_scholarships_boost is 'Added on top of the live scholarships_table count on the homepage Stats strip.';
comment on column site_settings.stats_results_boost is 'Added on top of the live results_table count on the homepage Stats strip.';
