-- Run this ONCE in Supabase SQL Editor.
--
-- site_settings is meant to hold exactly one row, but nothing ever enforced
-- that. If a second row was ever accidentally inserted (e.g. a save
-- happened before the table had its first row), the site could end up
-- reading an old row instead of your latest saved changes — which looks
-- like "my settings keep resetting after I save and refresh".
--
-- This keeps only the most-recently-updated row and deletes the rest.
-- Safe to run even if there's only one row already (it will delete nothing).

delete from site_settings
where id not in (
  select id from site_settings
  order by updated_at desc nulls last
  limit 1
);
