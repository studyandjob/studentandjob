-- ============================================================
-- "Banned" status for directory listings (admin Business Lists -> Banned)
-- Pehle add_owner_and_doctor.sql run honi chahiye. Safe to re-run.
--
-- Banned listing: website par nazar nahi aati (public policy sirf "published"
-- dikhati hai), owner usay edit nahi kar sakta, aur admin ki wajah
-- (admin_note) owner ko dashboard mein dikhti hai.
-- ============================================================

do $$
begin
  if to_regprocedure('public.directory_guard_business()') is null then
    raise exception 'Pehle sql/add_owner_and_doctor.sql run karein.';
  end if;
end $$;

alter table businesses_table drop constraint if exists businesses_listing_status_check;
alter table businesses_table add constraint businesses_listing_status_check
  check (listing_status in ('draft','pending','published','rejected','banned'));

-- Owner guard: banned listing par owner kuch nahi badal sakta
create or replace function directory_guard_business() returns trigger
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
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
    if old.listing_status = 'banned' then
      raise exception 'Yeh listing band (banned) hai — admin se rabta karein.';
    end if;
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
      new.listing_status := 'published';
    elsif new.listing_status = 'pending' then
      new.listing_status := 'pending';
      new.submitted_at := now();
    else
      new.listing_status := 'draft';
    end if;
  end if;
  return new;
end $$;

-- Doctor tables (clinics, FAQs, registration, documents): banned listing par owner likh nahi sakta
create or replace function directory_owns(p_business_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from businesses_table
    where id = p_business_id and owner_id = auth.uid() and listing_status <> 'banned'
  );
$$;
