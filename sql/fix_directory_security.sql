-- ============================================================
-- SECURITY FIX — directory ke tables sirf ADMIN ke liye
--
-- Masla: pehle ki SQL files mein policies "auth.role() = 'authenticated'"
-- par thin. Aap ki site par VIP Portal se koi bhi visitor signUp karke
-- "authenticated" ban sakta hai, yani woh businesses edit/delete kar sakta,
-- payment numbers badal sakta aur verification approve kar sakta tha.
--
-- Fix: ab sirf is_admin() (admin_users table wala owner login) pass hota hai.
-- Visitors ka public read aur "Get Verified" request bhejna waise hi chalta hai.
-- Pehle schema_v2_ai_portal.sql chali honi chahiye (is_admin() wahin banta hai).
-- Safe to re-run.
-- ============================================================

do $$
begin
  if to_regprocedure('public.is_admin()') is null then
    raise exception 'is_admin() nahi mila — pehle sql/schema_v2_ai_portal.sql run karein.';
  end if;
end $$;

-- ---- businesses
drop policy if exists "Auth can manage businesses_table" on businesses_table;
drop policy if exists "Admin manages businesses_table" on businesses_table;
create policy "Admin manages businesses_table" on businesses_table for all
  using (is_admin()) with check (is_admin());

-- ---- categories / cities / areas
drop policy if exists "Auth can manage directory_categories" on directory_categories;
drop policy if exists "Admin manages directory_categories" on directory_categories;
create policy "Admin manages directory_categories" on directory_categories for all
  using (is_admin()) with check (is_admin());

drop policy if exists "Auth can manage directory_cities" on directory_cities;
drop policy if exists "Admin manages directory_cities" on directory_cities;
create policy "Admin manages directory_cities" on directory_cities for all
  using (is_admin()) with check (is_admin());

drop policy if exists "Auth can manage directory_areas" on directory_areas;
drop policy if exists "Admin manages directory_areas" on directory_areas;
create policy "Admin manages directory_areas" on directory_areas for all
  using (is_admin()) with check (is_admin());

-- ---- verified-badge tables (agar add_verified_badges.sql chal chuki ho)
do $$
begin
  if to_regclass('public.directory_settings') is not null then
    execute 'drop policy if exists "Auth can manage directory_settings" on directory_settings';
    execute 'drop policy if exists "Admin manages directory_settings" on directory_settings';
    execute 'create policy "Admin manages directory_settings" on directory_settings for all using (is_admin()) with check (is_admin())';
  end if;
  if to_regclass('public.verification_requests') is not null then
    execute 'drop policy if exists "Auth can manage verification_requests" on verification_requests';
    execute 'drop policy if exists "Admin manages verification_requests" on verification_requests';
    execute 'create policy "Admin manages verification_requests" on verification_requests for all using (is_admin()) with check (is_admin())';
  end if;
end $$;

-- ---- approve function: sirf admin
do $$
begin
  if to_regprocedure('public.directory_approve_verification(uuid,integer)') is not null then
    execute $f$
      create or replace function directory_approve_verification(p_request_id uuid, p_months int default null)
      returns timestamptz
      language plpgsql security definer set search_path = public as $body$
      declare
        req verification_requests;
        m int;
        base timestamptz;
        new_until timestamptz;
      begin
        if not is_admin() then
          raise exception 'Sirf admin approve kar sakta hai';
        end if;

        select * into req from verification_requests where id = p_request_id for update;
        if not found then raise exception 'Request nahi mili'; end if;
        if req.status <> 'pending' then raise exception 'Yeh request pehle hi review ho chuki hai'; end if;

        m := coalesce(p_months, req.plan_months, (select verified_months from directory_settings where id = 1), 12);

        select greatest(now(), coalesce(case when verification_status = 'verified' then verified_until end, now()))
          into base from businesses_table where id = req.business_id;
        new_until := base + make_interval(months => m);

        update businesses_table set verification_status = 'verified', verified_until = new_until where id = req.business_id;
        update verification_requests set status = 'approved', reviewed_at = now() where id = p_request_id;
        return new_until;
      end $body$
    $f$;
    execute 'revoke all on function directory_approve_verification(uuid, int) from public';
    execute 'grant execute on function directory_approve_verification(uuid, int) to authenticated';
  end if;
end $$;
