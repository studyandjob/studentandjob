-- Adds a free-text "Description" field to jobs, for extra details that
-- don't fit the structured fields (role summary, responsibilities, extra
-- eligibility notes, etc). Shown to candidates on the public job details
-- modal, right under the official-source strip.
--
-- Safe to run multiple times.

alter table jobs_table add column if not exists description text;
