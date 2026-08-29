-- ============================================================
-- Auto-delete expired jobs
-- Run this once in the Supabase SQL editor (Project > SQL Editor).
-- Safe to re-run.
-- ============================================================
--
-- What this does:
--  1. Adds a `job_delete_after_days` setting to site_settings, editable
--     from Admin Dashboard -> Jobs (top of the page). e.g. 30 means a
--     job gets deleted 30 days AFTER its last_date has passed.
--     0 or NULL = auto-delete turned off (expired jobs are kept, just
--     shown as "Closed" until an admin deletes them manually).
--  2. Adds a `delete_expired_jobs()` function that removes every job
--     whose (last_date + job_delete_after_days) is in the past.
--  3. Wires it up to run automatically once a day via pg_cron, AND
--     every time the admin opens the Jobs tab (see JobsManager.jsx) —
--     so cleanup happens without adding any query load to the public
--     website itself.

-- 1. Setting column on the single-row site_settings config table
alter table site_settings add column if not exists job_delete_after_days int default 30;

-- 2. Cleanup function
create or replace function delete_expired_jobs()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_days int;
begin
  select job_delete_after_days into v_days
  from site_settings
  order by updated_at desc nulls last
  limit 1;

  -- 0 or NULL disables auto-delete entirely
  if v_days is null or v_days <= 0 then
    return;
  end if;

  delete from jobs_table
  where last_date is not null
    and last_date + (v_days || ' days')::interval < now();
end;
$$;

-- 3a. Let the admin dashboard call this via supabase.rpc('delete_expired_jobs')
grant execute on function delete_expired_jobs() to authenticated;

-- 3b. Optional but recommended: run automatically once a day even if no
-- admin logs in, so old jobs are cleared without waiting on a dashboard
-- visit. Requires the pg_cron extension (Database -> Extensions -> pg_cron
-- in the Supabase dashboard). Uncomment the line below after enabling it.
-- select cron.schedule('delete-expired-jobs', '0 0 * * *', 'select delete_expired_jobs();');
