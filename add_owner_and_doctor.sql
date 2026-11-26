-- ============================================================
-- BUSINESS OWNER ACCOUNTS + DOCTOR PROFILES (Phase 2)
--
-- Pehle chalni chahiye: schema_v2_ai_portal.sql (is_admin()),
-- add_directory_phase1.sql, add_verified_badges.sql.
-- Safe to re-run.
--
-- Kya banta hai:
--   * Business owner email+password se register karke apni listing add karta hai
--   * Nayi listing pehle "pending" hoti hai — admin approve kare tab public hoti hai
--   * Owner sirf apni listing dekh/edit kar sakta hai; featured, verified badge,
--     display order jaise admin ke fields woh badal NAHI sakta (trigger rokta hai)
--   * Doctor profile: doctor_profiles, doctor_clinics (kai clinics), doctor_faqs
--   * PMDC number aur documents PRIVATE: doctor_registration, doctor_documents,
--     private storage bucket — public API se kabhi nahi milte
--   * Report aur Claim requests
-- ============================================================

do $$
begin
  if to_regprocedure('public.is_admin()') is null then
    raise exception 'is_admin() nahi mila — pehle sql/schema_v2_ai_portal.sql run karein.';
  end if;
  if to_regclass('public.directory_cities') is null or to_regclass('public.verification_requests') is null then
    raise exception 'Pehle add_directory_phase1.sql aur add_verified_badges.sql run karein.';
  end if;
end $$;

-- ---------- 1) businesses_table: owner + approval columns ----------
alter table businesses_table add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table businesses_table add column if not exists listing_status text not null default 'published';
alter table businesses_table add column if not exists profile_type text not null default 'general';
alter table businesses_table add column if not exists admin_note text;
alter table businesses_table add column if not exists submitted_at timestamptz;
alter table businesses_table add column if not exists updated_at timestamptz default now();

alter table businesses_table drop constraint if exists businesses_listing_status_check;
alter table businesses_table add constraint businesses_listing_status_check
  check (listing_status in ('draft','pending','published','rejected'));
alter table businesses_table drop constraint if exists businesses_profile_type_check;
alter table businesses_table add constraint businesses_profile_type_check
  check (profile_type in ('general','doctor'));

create index if not exists businesses_owner_idx on businesses_table (owner_id);
create index if not exists businesses_status_idx on businesses_table (listing_status);

create or replace function directory_touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists directory_business_touch_trg on businesses_table;
create trigger directory_business_touch_trg before update on businesses_table
  for each row execute function directory_touch_updated_at();

-- ---------- 2) Owner guard: owner admin-only fields nahi badal sakta ----------
create or replace function directory_guard_business() returns trigger
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  -- admin, ya service role / SQL editor (uid null) par koi rok nahi
  if uid is null or is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.owner_id := uid;
    new.is_featured := false;
    new.verification_status := 'unverified';
    new.verified_until := null;
    new.display_order := 0;
    new.is_active := true;
    new.admin_note := null;
    new.listing_status := case when new.listing_status = 'pending' then 'pending' else 'draft' end;
    new.submitted_at := case when new.listing_status = 'pending' then now() else null end;
  else
    new.owner_id := old.owner_id;
    new.is_featured := old.is_featured;
    new.verification_status := old.verification_status;
    new.verified_until := old.verified_until;
    new.display_order := old.display_order;
    new.is_active := old.is_active;
    new.admin_note := old.admin_note;
    new.slug := old.slug;
    new.created_at := old.created_at;
    if old.listing_status = 'published' then
      new.listing_status := 'published';           -- live listing par edit live rehti hai
    elsif new.listing_status = 'pending' then
      new.listing_status := 'pending';
      new.submitted_at := now();
    else
      new.listing_status := 'draft';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists directory_business_guard_trg on businesses_table;
create trigger directory_business_guard_trg before insert or update on businesses_table
  for each row execute function directory_guard_business();

-- ---------- 3) businesses_table RLS ----------
drop policy if exists "Public can read active businesses" on businesses_table;
drop policy if exists "Public can read published businesses" on businesses_table;
create policy "Public can read published businesses" on businesses_table for select
  using (is_active = true and listing_status = 'published');

drop policy if exists "Auth can manage businesses_table" on businesses_table;
drop policy if exists "Admin manages businesses_table" on businesses_table;
create policy "Admin manages businesses_table" on businesses_table for all
  using (is_admin()) with check (is_admin());

drop policy if exists "Owner reads own businesses" on businesses_table;
create policy "Owner reads own businesses" on businesses_table for select to authenticated
  using (owner_id = auth.uid());
drop policy if exists "Owner inserts own businesses" on businesses_table;
create policy "Owner inserts own businesses" on businesses_table for insert to authenticated
  with check (owner_id = auth.uid());
drop policy if exists "Owner updates own businesses" on businesses_table;
create policy "Owner updates own businesses" on businesses_table for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "Owner deletes own unpublished businesses" on businesses_table;
create policy "Owner deletes own unpublished businesses" on businesses_table for delete to authenticated
  using (owner_id = auth.uid() and listing_status in ('draft','pending','rejected'));

-- ---------- 4) Search/counts: sirf PUBLISHED listings (owner ko apni draft public search mein na dikhe) ----------
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
    where b.is_active and b.listing_status = 'published'
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

create or replace function directory_counts() returns jsonb
language sql stable security invoker set search_path = public as $$
  select jsonb_build_object(
    'categories', coalesce((
      select jsonb_object_agg(cid::text, n) from (
        select cid, count(*) as n from (
          select category_id as cid from businesses_table where is_active and listing_status = 'published' and category_id is not null
          union all
          select subcategory_id from businesses_table where is_active and listing_status = 'published' and subcategory_id is not null
        ) x group by cid
      ) y), '{}'::jsonb),
    'cities', coalesce((
      select jsonb_object_agg(city_id::text, n) from (
        select city_id, count(*) as n from businesses_table
        where is_active and listing_status = 'published' and city_id is not null group by city_id
      ) z), '{}'::jsonb)
  );
$$;


grant execute on function directory_counts() to anon, authenticated;

-- ---------- 5) Helper functions (RLS ke liye) ----------
create or replace function directory_owns(p_business_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from businesses_table where id = p_business_id and owner_id = auth.uid());
$$;

create or replace function directory_is_published(p_business_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from businesses_table where id = p_business_id and is_active and listing_status = 'published');
$$;

grant execute on function directory_owns(uuid) to anon, authenticated;
grant execute on function directory_is_published(uuid) to anon, authenticated;

-- ---------- 6) Doctor profile — PART 1 (public hisse) ----------
create table if not exists doctor_profiles (
  business_id uuid primary key references businesses_table(id) on delete cascade,
  gender text check (gender is null or gender in ('male','female','other')),
  professional_title text,
  short_intro text check (short_intro is null or char_length(short_intro) <= 300),
  biography text,
  languages text[] not null default '{}',
  degree text,
  degree_institution text,
  graduation_year int check (graduation_year is null or graduation_year between 1940 and 2100),
  postgraduate_qualifications text[] not null default '{}',
  additional_certifications text,
  medical_training text,
  main_specialization text,
  sub_specialization text,
  medical_services text[] not null default '{}',
  conditions_treated text[] not null default '{}',
  procedures_performed text[] not null default '{}',
  experience_years int check (experience_years is null or experience_years between 0 and 80),
  current_designation text,
  current_institution text,
  previous_institutions text,
  professional_memberships text,
  awards text,
  facebook_url text, instagram_url text, linkedin_url text, youtube_url text,
  seo_title text check (seo_title is null or char_length(seo_title) <= 70),
  seo_description text check (seo_description is null or char_length(seo_description) <= 170),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists doctor_profiles_spec_idx on doctor_profiles (main_specialization);
drop trigger if exists doctor_profiles_touch_trg on doctor_profiles;
create trigger doctor_profiles_touch_trg before update on doctor_profiles for each row execute function directory_touch_updated_at();

-- ---------- 7) PMDC registration — PRIVATE (public API se nahi milta) ----------
create table if not exists doctor_registration (
  business_id uuid primary key references businesses_table(id) on delete cascade,
  pmdc_number text,
  registration_status text not null default 'unknown' check (registration_status in ('active','expired','renewal','suspended','unknown')),
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected')),
  verification_date date,
  verified_by text,
  admin_note text,
  updated_at timestamptz default now()
);

create or replace function directory_guard_registration() returns trigger
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null or is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.verification_status := 'pending';
    new.verification_date := null; new.verified_by := null; new.admin_note := null;
  else
    new.verification_status := old.verification_status;
    new.verification_date := old.verification_date;
    new.verified_by := old.verified_by;
    new.admin_note := old.admin_note;
    -- PMDC number badalne par dobara verification zaroori
    if new.pmdc_number is distinct from old.pmdc_number and old.verification_status = 'verified' then
      new.verification_status := 'pending';
      new.verification_date := null;
      new.verified_by := null;
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists doctor_registration_guard_trg on doctor_registration;
create trigger doctor_registration_guard_trg before insert or update on doctor_registration
  for each row execute function directory_guard_registration();

create table if not exists doctor_documents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses_table(id) on delete cascade,
  file_path text not null,
  file_name text,
  doc_type text default 'pmdc',
  created_at timestamptz default now()
);
create index if not exists doctor_documents_business_idx on doctor_documents (business_id);

-- ---------- 8) PART 2: clinics (ek doctor ke kai clinics) ----------
create table if not exists doctor_clinics (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses_table(id) on delete cascade,
  clinic_name text not null,
  clinic_type text,
  address text,
  country text not null default 'Pakistan',
  province text,
  city_id uuid references directory_cities(id) on delete set null,
  area_id uuid references directory_areas(id) on delete set null,
  map_link text,
  latitude double precision check (latitude is null or latitude between -90 and 90),
  longitude double precision check (longitude is null or longitude between -180 and 180),
  phone text, whatsapp text, email text, website text, booking_link text,
  consultation_fee int check (consultation_fee is null or consultation_fee >= 0),
  followup_fee int check (followup_fee is null or followup_fee >= 0),
  appointment_required boolean not null default false,
  online_consultation boolean not null default false,
  home_visit boolean not null default false,
  emergency_services boolean not null default false,
  schedule jsonb not null default '{}'::jsonb check (jsonb_typeof(schedule) = 'object'),
  break_start time,
  break_end time,
  is_primary boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists doctor_clinics_business_idx on doctor_clinics (business_id);
drop trigger if exists doctor_clinics_touch_trg on doctor_clinics;
create trigger doctor_clinics_touch_trg before update on doctor_clinics for each row execute function directory_touch_updated_at();

create table if not exists doctor_faqs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses_table(id) on delete cascade,
  question text not null check (char_length(question) between 3 and 300),
  answer text not null check (char_length(answer) between 1 and 2000),
  display_order int not null default 0,
  created_at timestamptz default now()
);
create index if not exists doctor_faqs_business_idx on doctor_faqs (business_id);

-- ---------- 9) RLS: doctor tables ----------
alter table doctor_profiles enable row level security;
alter table doctor_registration enable row level security;
alter table doctor_documents enable row level security;
alter table doctor_clinics enable row level security;
alter table doctor_faqs enable row level security;

-- public hisse: sirf PUBLISHED listing ke
drop policy if exists "Public reads published doctor_profiles" on doctor_profiles;
create policy "Public reads published doctor_profiles" on doctor_profiles for select using (directory_is_published(business_id));
drop policy if exists "Public reads published doctor_clinics" on doctor_clinics;
create policy "Public reads published doctor_clinics" on doctor_clinics for select using (directory_is_published(business_id));
drop policy if exists "Public reads published doctor_faqs" on doctor_faqs;
create policy "Public reads published doctor_faqs" on doctor_faqs for select using (directory_is_published(business_id));

-- owner: sirf apna
do $$
declare t text;
begin
  foreach t in array array['doctor_profiles','doctor_clinics','doctor_faqs','doctor_registration','doctor_documents'] loop
    execute format('drop policy if exists "Owner manages own %1$s" on %1$s', t);
    execute format('create policy "Owner manages own %1$s" on %1$s for all to authenticated using (directory_owns(business_id)) with check (directory_owns(business_id))', t);
    execute format('drop policy if exists "Admin manages %1$s" on %1$s', t);
    execute format('create policy "Admin manages %1$s" on %1$s for all using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;
-- doctor_registration aur doctor_documents par PUBLIC policy jaan-boojh kar nahi hai.

-- Public profile par sirf VERIFIED PMDC dikhta hai (number + status), aur kuch nahi
create or replace function directory_doctor_registration_public(p_business_id uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'pmdc_number', r.pmdc_number,
    'registration_status', r.registration_status,
    'verification_date', r.verification_date
  )
  from doctor_registration r
  where r.business_id = p_business_id
    and r.verification_status = 'verified'
    and r.pmdc_number is not null
    and directory_is_published(p_business_id);
$$;
grant execute on function directory_doctor_registration_public(uuid) to anon, authenticated;

-- ---------- 10) Report + Claim ----------
create table if not exists listing_reports (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses_table(id) on delete cascade,
  reason text not null check (reason in ('wrong_info','closed','fake','inappropriate','other')),
  details text check (details is null or char_length(details) <= 1000),
  contact text check (contact is null or char_length(contact) <= 100),
  status text not null default 'open' check (status in ('open','resolved','dismissed')),
  created_at timestamptz default now()
);
alter table listing_reports enable row level security;
drop policy if exists "Anyone can report a listing" on listing_reports;
create policy "Anyone can report a listing" on listing_reports for insert to anon, authenticated
  with check (status = 'open' and directory_is_published(business_id));
drop policy if exists "Admin manages listing_reports" on listing_reports;
create policy "Admin manages listing_reports" on listing_reports for all using (is_admin()) with check (is_admin());

create table if not exists claim_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses_table(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  claimant_name text not null check (char_length(claimant_name) between 2 and 80),
  phone text not null check (char_length(phone) between 7 and 20),
  message text check (message is null or char_length(message) <= 500),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now(),
  reviewed_at timestamptz
);
create unique index if not exists claim_one_pending_idx on claim_requests (business_id, user_id) where status = 'pending';
alter table claim_requests enable row level security;
drop policy if exists "Owner creates own claim" on claim_requests;
create policy "Owner creates own claim" on claim_requests for insert to authenticated
  with check (
    user_id = auth.uid() and status = 'pending' and reviewed_at is null
    and exists (select 1 from businesses_table b where b.id = business_id and b.owner_id is null and b.is_active and b.listing_status = 'published')
  );
drop policy if exists "Owner reads own claims" on claim_requests;
create policy "Owner reads own claims" on claim_requests for select to authenticated using (user_id = auth.uid());
drop policy if exists "Admin manages claim_requests" on claim_requests;
create policy "Admin manages claim_requests" on claim_requests for all using (is_admin()) with check (is_admin());

create or replace function directory_approve_claim(p_request_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare req claim_requests;
begin
  if not is_admin() then raise exception 'Sirf admin approve kar sakta hai'; end if;
  select * into req from claim_requests where id = p_request_id for update;
  if not found then raise exception 'Request nahi mili'; end if;
  if req.status <> 'pending' then raise exception 'Yeh request pehle hi review ho chuki hai'; end if;
  update businesses_table set owner_id = req.user_id where id = req.business_id;
  update claim_requests set status = 'approved', reviewed_at = now() where id = p_request_id;
  update claim_requests set status = 'rejected', reviewed_at = now() where business_id = req.business_id and status = 'pending' and id <> p_request_id;
end $$;
revoke all on function directory_approve_claim(uuid) from public;
grant execute on function directory_approve_claim(uuid) to authenticated;

-- Admin ke liye: owner ki email (public table mein email nahi rakhi jati)
create or replace function directory_owner_email(p_business_id uuid) returns text
language plpgsql stable security definer set search_path = public as $$
declare e text;
begin
  if not is_admin() then return null; end if;
  select u.email into e from businesses_table b join auth.users u on u.id = b.owner_id where b.id = p_business_id;
  return e;
end $$;
revoke all on function directory_owner_email(uuid) from public;
grant execute on function directory_owner_email(uuid) to authenticated;

-- ---------- 11) Storage: owner photos (public) aur PMDC documents (PRIVATE) ----------
do $$
begin
  if to_regclass('storage.buckets') is null then
    raise notice 'storage schema nahi mila — buckets Supabase dashboard se banayein: business-photos (public), doctor-documents (private).';
    return;
  end if;

  begin
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('business-photos', 'business-photos', true, 5242880, array['image/jpeg','image/png','image/webp'])
    on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp'];
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('doctor-documents', 'doctor-documents', false, 8388608, array['application/pdf','image/jpeg','image/png','image/webp'])
    on conflict (id) do update set public = false, file_size_limit = 8388608, allowed_mime_types = array['application/pdf','image/jpeg','image/png','image/webp'];
  exception when undefined_column then
    insert into storage.buckets (id, name, public) values ('business-photos', 'business-photos', true)
    on conflict (id) do update set public = true;
    insert into storage.buckets (id, name, public) values ('doctor-documents', 'doctor-documents', false)
    on conflict (id) do update set public = false;
  end;

  -- business-photos: sab dekh sakte hain; likh sirf apne folder (uid/...) mein sakte hain
  drop policy if exists "Public views business-photos" on storage.objects;
  create policy "Public views business-photos" on storage.objects for select using (bucket_id = 'business-photos');
  drop policy if exists "Owner uploads business-photos" on storage.objects;
  create policy "Owner uploads business-photos" on storage.objects for insert to authenticated
    with check (bucket_id = 'business-photos' and ((storage.foldername(name))[1] = auth.uid()::text or is_admin()));
  drop policy if exists "Owner updates business-photos" on storage.objects;
  create policy "Owner updates business-photos" on storage.objects for update to authenticated
    using (bucket_id = 'business-photos' and ((storage.foldername(name))[1] = auth.uid()::text or is_admin()));
  drop policy if exists "Owner deletes business-photos" on storage.objects;
  create policy "Owner deletes business-photos" on storage.objects for delete to authenticated
    using (bucket_id = 'business-photos' and ((storage.foldername(name))[1] = auth.uid()::text or is_admin()));

  -- doctor-documents: PRIVATE — sirf uploader (apna folder) aur admin
  drop policy if exists "Owner or admin reads doctor-documents" on storage.objects;
  create policy "Owner or admin reads doctor-documents" on storage.objects for select to authenticated
    using (bucket_id = 'doctor-documents' and ((storage.foldername(name))[1] = auth.uid()::text or is_admin()));
  drop policy if exists "Owner uploads doctor-documents" on storage.objects;
  create policy "Owner uploads doctor-documents" on storage.objects for insert to authenticated
    with check (bucket_id = 'doctor-documents' and ((storage.foldername(name))[1] = auth.uid()::text or is_admin()));
  drop policy if exists "Owner or admin deletes doctor-documents" on storage.objects;
  create policy "Owner or admin deletes doctor-documents" on storage.objects for delete to authenticated
    using (bucket_id = 'doctor-documents' and ((storage.foldername(name))[1] = auth.uid()::text or is_admin()));
end $$;
