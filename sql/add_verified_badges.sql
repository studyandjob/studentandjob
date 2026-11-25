-- ============================================================
-- Paid VERIFIED badge system (manual payment + admin approval)
-- Pehle add_directory_phase1.sql run honi chahiye. Safe to re-run.
--
-- Flow:
--   1. Business ke page par "Get Verified" form -> verification_requests
--   2. Visitor JazzCash / Easypaisa / bank se payment karta hai
--   3. Admin payment check karke "Approve" dabata hai
--   4. Badge ek muqarrar muddat ke liye lagta hai (verified_until) aur
--      muddat khatam hote hi KHUD hat jata hai — kisi cron ki zaroorat nahi
-- ============================================================

alter table businesses_table add column if not exists verified_until timestamptz;

-- ---------- Qeemat / payment ki maloomat (admin se badli ja sakti hain) ----------
create table if not exists directory_settings (
  id int primary key default 1 check (id = 1),
  verified_enabled boolean not null default true,
  verified_price int not null default 2000,       -- PKR
  verified_months int not null default 12,
  account_title text,
  jazzcash_number text,
  easypaisa_number text,
  bank_details text,
  extra_instructions text,
  updated_at timestamptz default now()
);
insert into directory_settings (id) values (1) on conflict (id) do nothing;

alter table directory_settings enable row level security;
drop policy if exists "Public can read directory_settings" on directory_settings;
create policy "Public can read directory_settings" on directory_settings for select using (true);
drop policy if exists "Auth can manage directory_settings" on directory_settings;
create policy "Auth can manage directory_settings" on directory_settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------- Verification requests ----------
create table if not exists verification_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses_table(id) on delete cascade,
  requester_name text not null check (char_length(requester_name) between 2 and 80),
  phone text not null check (char_length(phone) between 7 and 20),
  payment_method text not null check (payment_method in ('jazzcash','easypaisa','bank','other')),
  transaction_id text not null check (char_length(transaction_id) between 3 and 60),
  amount int check (amount is null or amount >= 0),
  plan_months int check (plan_months is null or plan_months between 1 and 120),
  note text check (note is null or char_length(note) <= 500),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note text,
  created_at timestamptz default now(),
  reviewed_at timestamptz
);
create index if not exists verification_requests_status_idx on verification_requests (status, created_at desc);
create index if not exists verification_requests_business_idx on verification_requests (business_id);
-- Ek business ki ek waqt mein sirf ek pending request (spam se bachao)
create unique index if not exists verification_one_pending_idx on verification_requests (business_id) where status = 'pending';

alter table verification_requests enable row level security;

-- Koi bhi visitor request bhej sakta hai, magar parh nahi sakta
drop policy if exists "Anyone can request verification" on verification_requests;
create policy "Anyone can request verification" on verification_requests for insert
  to anon, authenticated
  with check (
    status = 'pending' and reviewed_at is null and admin_note is null
    and exists (select 1 from businesses_table b where b.id = business_id and b.is_active)
  );
drop policy if exists "Auth can manage verification_requests" on verification_requests;
create policy "Auth can manage verification_requests" on verification_requests for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------- Approve (atomic): badge lagao + muddat barhao ----------
create or replace function directory_approve_verification(p_request_id uuid, p_months int default null)
returns timestamptz
language plpgsql security definer set search_path = public as $$
declare
  req verification_requests;
  m int;
  base timestamptz;
  new_until timestamptz;
begin
  if auth.role() is distinct from 'authenticated' then
    raise exception 'Sirf admin approve kar sakta hai';
  end if;

  select * into req from verification_requests where id = p_request_id for update;
  if not found then raise exception 'Request nahi mili'; end if;
  if req.status <> 'pending' then raise exception 'Yeh request pehle hi review ho chuki hai'; end if;

  m := coalesce(p_months, req.plan_months, (select verified_months from directory_settings where id = 1), 12);

  -- Agar badge abhi chal raha hai to muddat uske baad se barhti hai
  select greatest(now(), coalesce(case when verification_status = 'verified' then verified_until end, now()))
    into base from businesses_table where id = req.business_id;
  new_until := base + make_interval(months => m);

  update businesses_table set verification_status = 'verified', verified_until = new_until where id = req.business_id;
  update verification_requests set status = 'approved', reviewed_at = now() where id = p_request_id;
  return new_until;
end $$;

revoke all on function directory_approve_verification(uuid, int) from public;
grant execute on function directory_approve_verification(uuid, int) to authenticated;

-- ---------- Search: ab expiry ka khayal rakhti hai, verified listings ko tarjeeh ----------
create or replace function directory_search(
  p_lat double precision default null,
  p_lng double precision default null,
  p_radius_km double precision default null,
  p_city_id uuid default null,
  p_area_id uuid default null,
  p_category_id uuid default null,   -- category YA subcategory
  p_q text default null,
  p_verified_only boolean default false,
  p_sort text default 'featured',    -- nearest | featured | recent
  p_limit int default 24,
  p_offset int default 0
) returns jsonb
language plpgsql stable security invoker set search_path = public as $$
declare
  result jsonb;
  pat text;
begin
  pat := case when p_q is null or btrim(p_q) = '' then null
         else '%' || replace(replace(replace(btrim(p_q), '\', '\\'), '%', '\%'), '_', '\_') || '%' end;

  with base as (
    select b.*,
      (b.verification_status = 'verified' and (b.verified_until is null or b.verified_until > now())) as is_verified,
      case when p_lat is not null and p_lng is not null and b.latitude is not null and b.longitude is not null
        then 2 * 6371 * asin(sqrt(
               power(sin(radians(b.latitude - p_lat) / 2), 2) +
               cos(radians(p_lat)) * cos(radians(b.latitude)) * power(sin(radians(b.longitude - p_lng) / 2), 2)))
      end as distance_km
    from businesses_table b
    where b.is_active
      and (p_city_id is null or b.city_id = p_city_id)
      and (p_area_id is null or b.area_id = p_area_id)
      and (p_category_id is null or b.category_id = p_category_id or b.subcategory_id = p_category_id)
      and (not p_verified_only or (b.verification_status = 'verified' and (b.verified_until is null or b.verified_until > now())))
      and (pat is null
           or b.name ilike pat or b.short_description ilike pat or b.description ilike pat
           or b.services ilike pat or b.address ilike pat or b.category ilike pat
           or exists (select 1 from directory_categories dc
                      where dc.id in (b.category_id, b.subcategory_id) and dc.name ilike pat))
  ), filtered as (
    select * from base
    where p_radius_km is null or (distance_km is not null and distance_km <= p_radius_km)
  )
  select jsonb_build_object(
    'total', (select count(*) from filtered),
    'rows', coalesce((
      select jsonb_agg(to_jsonb(r) order by r.rn) from (
        select f.*, row_number() over (
          order by
            (case when p_sort = 'nearest' then f.distance_km end) asc nulls last,
            (case when p_sort = 'recent' then extract(epoch from f.created_at) end) desc nulls last,
            (case when p_sort = 'featured' then (case when f.is_featured then 0 when f.is_verified then 1 else 2 end) end) asc,
            f.display_order asc,
            f.created_at desc
        ) as rn
        from filtered f
        order by rn
        limit greatest(least(p_limit, 60), 1) offset greatest(p_offset, 0)
      ) r
    ), '[]'::jsonb)
  ) into result;

  return result;
end $$;


grant execute on function directory_search(double precision, double precision, double precision, uuid, uuid, uuid, text, boolean, text, int, int) to anon, authenticated;
