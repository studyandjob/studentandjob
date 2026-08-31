-- ============================================================
-- Structured Job Details — Schema Add-on (v4)
-- Run this AFTER sql/schema_v2_ai_portal.sql in the Supabase SQL Editor.
-- Safe to re-run (uses IF NOT EXISTS throughout).
--
-- Adds the extra fields needed for the full "Job Details" format:
--   Salary, Number of Vacancies, Age Limit, Experience,
--   Official Website (separate from the Apply Now link).
-- ============================================================

alter table jobs_table add column if not exists salary text;              -- e.g. "BPS-11 (Rs. 30,000 - 45,000)" or "Market Competitive"
alter table jobs_table add column if not exists vacancies text;           -- e.g. "12" or "Multiple"
alter table jobs_table add column if not exists age_limit text;           -- e.g. "18 - 30 years (relaxation as per govt policy)"
alter table jobs_table add column if not exists experience_required text; -- e.g. "2 years relevant experience" or "Fresh graduates can apply"
alter table jobs_table add column if not exists official_website text;    -- the organization's official website (distinct from the specific apply/portal link)

comment on column jobs_table.salary is 'Displayed on the public Job Details page.';
comment on column jobs_table.vacancies is 'Number of Vacancies — free text so admin can write "12", "Multiple", "05 Posts" etc.';
comment on column jobs_table.age_limit is 'Age Limit — free text to allow relaxation notes.';
comment on column jobs_table.experience_required is 'Experience requirement — free text.';
comment on column jobs_table.official_website is 'Official organization website. Shown next to "Official Advertisement" as the Source of the job.';
