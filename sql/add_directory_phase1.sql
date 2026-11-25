-- ============================================================
-- Pakistan Smart Business Directory — PHASE 1
-- Pehle sql/add_business_directory.sql run karein, phir yeh file.
-- Safe to re-run. Supabase SQL Editor mein run karein.
--
-- Kya banta hai:
--   * directory_categories  (categories + subcategories, admin se manage)
--   * directory_cities      (50+ Pakistani cities, lat/lng ke sath)
--   * directory_areas       (city ke areas)
--   * businesses_table mein naye columns (city/category ids, lat/lng,
--     slug, verification_status, short_description)
--   * directory_search()    nearby + search + filter + sort (database mein)
--   * directory_counts()    categories / cities ki counting
--
-- Note: nearby search abhi Haversine formula se hoti hai (koi extension
-- nahi chahiye). Hazaron listings ke baad PostGIS par shift kiya ja sakta hai.
-- ============================================================

-- ---------- 1) Taxonomy tables ----------
create table if not exists directory_categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references directory_categories(id) on delete cascade,
  name text not null,
  slug text not null unique,
  icon text default 'briefcase',
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now()
);
create index if not exists directory_categories_parent_idx on directory_categories (parent_id);

create table if not exists directory_cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  province text,
  latitude double precision,
  longitude double precision,
  is_popular boolean not null default false,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists directory_areas (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references directory_cities(id) on delete cascade,
  name text not null,
  display_order int not null default 0,
  created_at timestamptz default now(),
  unique (city_id, name)
);
create index if not exists directory_areas_city_idx on directory_areas (city_id);

alter table directory_categories enable row level security;
alter table directory_cities enable row level security;
alter table directory_areas enable row level security;

drop policy if exists "Public can read directory_categories" on directory_categories;
create policy "Public can read directory_categories" on directory_categories for select using (is_active = true);
drop policy if exists "Auth can manage directory_categories" on directory_categories;
create policy "Auth can manage directory_categories" on directory_categories for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Public can read directory_cities" on directory_cities;
create policy "Public can read directory_cities" on directory_cities for select using (is_active = true);
drop policy if exists "Auth can manage directory_cities" on directory_cities;
create policy "Auth can manage directory_cities" on directory_cities for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Public can read directory_areas" on directory_areas;
create policy "Public can read directory_areas" on directory_areas for select using (true);
drop policy if exists "Auth can manage directory_areas" on directory_areas;
create policy "Auth can manage directory_areas" on directory_areas for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------- 2) businesses_table: naye columns ----------
alter table businesses_table add column if not exists category_id uuid references directory_categories(id) on delete set null;
alter table businesses_table add column if not exists subcategory_id uuid references directory_categories(id) on delete set null;
alter table businesses_table add column if not exists city_id uuid references directory_cities(id) on delete set null;
alter table businesses_table add column if not exists area_id uuid references directory_areas(id) on delete set null;
alter table businesses_table add column if not exists latitude double precision;
alter table businesses_table add column if not exists longitude double precision;
alter table businesses_table add column if not exists slug text;
alter table businesses_table add column if not exists short_description text;
alter table businesses_table add column if not exists verification_status text not null default 'unverified';

alter table businesses_table drop constraint if exists businesses_verification_check;
alter table businesses_table add constraint businesses_verification_check
  check (verification_status in ('unverified','pending','verified','rejected','suspended'));
alter table businesses_table drop constraint if exists businesses_lat_check;
alter table businesses_table add constraint businesses_lat_check check (latitude is null or (latitude between -90 and 90));
alter table businesses_table drop constraint if exists businesses_lng_check;
alter table businesses_table add constraint businesses_lng_check check (longitude is null or (longitude between -180 and 180));

-- Purane text columns ab zaroori nahi (sirf purani listings ke liye bache hain)
alter table businesses_table alter column category drop not null;
alter table businesses_table alter column area drop not null;

create index if not exists businesses_city_idx on businesses_table (city_id);
create index if not exists businesses_category_idx on businesses_table (category_id);
create index if not exists businesses_subcategory_idx on businesses_table (subcategory_id);
create index if not exists businesses_geo_idx on businesses_table (latitude, longitude);
create unique index if not exists businesses_slug_idx on businesses_table (slug);

-- Saaf URL: naam + id ke 6 huroof, e.g. al-shifa-clinic-1a2b3c
create or replace function directory_set_business_slug() returns trigger
language plpgsql as $$
declare base text;
begin
  if new.slug is null or new.slug = '' then
    base := trim(both '-' from regexp_replace(lower(coalesce(new.name, '')), '[^a-z0-9]+', '-', 'g'));
    if base = '' then base := 'business'; end if;
    new.slug := base || '-' || substr(replace(new.id::text, '-', ''), 1, 6);
  end if;
  return new;
end $$;

drop trigger if exists directory_business_slug_trg on businesses_table;
create trigger directory_business_slug_trg before insert on businesses_table
  for each row execute function directory_set_business_slug();

update businesses_table set slug = null where slug = '';
update businesses_table
set slug = coalesce(nullif(trim(both '-' from regexp_replace(lower(coalesce(name,'')), '[^a-z0-9]+', '-', 'g')), ''), 'business')
           || '-' || substr(replace(id::text, '-', ''), 1, 6)
where slug is null;

-- ---------- 3) Categories seed ----------
insert into directory_categories (name, slug, icon, display_order) values
  ('Homes & Properties',        'homes-properties',      'home',      1),
  ('Hotels & Accommodation',    'hotels-accommodation',  'building',  2),
  ('Hospitals',                 'hospitals',             'heart',     3),
  ('Doctors & Clinics',         'doctors',               'shield',    4),
  ('Schools',                   'schools',               'teacher',   5),
  ('Colleges & Universities',   'colleges-universities', 'grad',      6),
  ('Academies',                 'academies',             'users',     7),
  ('Factories & Industries',    'factories-industries',  'briefcase', 8),
  ('Advocates & Legal Services','advocates-legal',       'document',  9),
  ('Parks & Recreation',        'parks-recreation',      'pin',      10),
  ('Restaurants & Food',        'restaurants-food',      'gift',     11),
  ('Shops & Retail',            'shops-retail',          'money',    12),
  ('Repair & Home Services',    'repair-services',       'briefcase',13),
  ('Other',                     'other',                 'star',     99)
on conflict (slug) do nothing;

insert into directory_categories (name, slug, parent_id, display_order)
select v.name, v.slug, p.id, v.ord
from (values
  ('Houses for Rent','houses-for-rent','homes-properties',1),
  ('Houses for Sale','houses-for-sale','homes-properties',2),
  ('Apartments','apartments','homes-properties',3),
  ('Rooms','rooms','homes-properties',4),
  ('Farmhouses','farmhouses','homes-properties',5),
  ('Commercial Properties','commercial-properties','homes-properties',6),
  ('Hotels','hotels','hotels-accommodation',1),
  ('Guest Houses','guest-houses','hotels-accommodation',2),
  ('Resorts','resorts','hotels-accommodation',3),
  ('Hostels','hostels','hotels-accommodation',4),
  ('Vacation Rentals','vacation-rentals','hotels-accommodation',5),
  ('Government Hospitals','government-hospitals','hospitals',1),
  ('Private Hospitals','private-hospitals','hospitals',2),
  ('Emergency Hospitals','emergency-hospitals','hospitals',3),
  ('Specialized Hospitals','specialized-hospitals','hospitals',4),
  ('General Physicians','general-physicians','doctors',1),
  ('Specialists','specialists','doctors',2),
  ('Dentists','dentists','doctors',3),
  ('Clinics','clinics','doctors',4),
  ('Diagnostic Centers','diagnostic-centers','doctors',5),
  ('Government Schools','government-schools','schools',1),
  ('Private Schools','private-schools','schools',2),
  ('Primary Schools','primary-schools','schools',3),
  ('High Schools','high-schools','schools',4),
  ('Colleges','colleges','colleges-universities',1),
  ('Universities','universities','colleges-universities',2),
  ('Technical Institutes','technical-institutes','colleges-universities',3),
  ('Tuition Academies','tuition-academies','academies',1),
  ('Coaching Centers','coaching-centers','academies',2),
  ('Entry Test Preparation','entry-test-preparation','academies',3),
  ('Computer Academies','computer-academies','academies',4),
  ('Language Institutes','language-institutes','academies',5),
  ('Manufacturers','manufacturers','factories-industries',1),
  ('Textile Mills','textile-mills','factories-industries',2),
  ('Food Factories','food-factories','factories-industries',3),
  ('Industrial Units','industrial-units','factories-industries',4),
  ('Suppliers','suppliers','factories-industries',5),
  ('Advocates','advocates','advocates-legal',1),
  ('Law Firms','law-firms','advocates-legal',2),
  ('Legal Consultants','legal-consultants','advocates-legal',3),
  ('Property Lawyers','property-lawyers','advocates-legal',4),
  ('Public Parks','public-parks','parks-recreation',1),
  ('Family Parks','family-parks','parks-recreation',2),
  ('Playgrounds','playgrounds','parks-recreation',3),
  ('Tourist Attractions','tourist-attractions','parks-recreation',4),
  ('Entertainment Places','entertainment-places','parks-recreation',5),
  ('Plumbers & Electricians','plumbers-electricians','repair-services',1)
) as v(name, slug, parent_slug, ord)
join directory_categories p on p.slug = v.parent_slug
on conflict (slug) do nothing;

-- ---------- 4) Cities seed (Pakistan ke 60+ shehar) ----------
-- Coordinates taqreeban shehar ka markaz hain; admin se theek kiye ja sakte hain.
insert into directory_cities (name, slug, province, latitude, longitude, is_popular, display_order) values
  ('Islamabad','islamabad','Islamabad Capital Territory',33.6844,73.0479,true,1),
  ('Lahore','lahore','Punjab',31.5204,74.3587,true,2),
  ('Karachi','karachi','Sindh',24.8607,67.0011,true,3),
  ('Rawalpindi','rawalpindi','Punjab',33.5651,73.0169,true,4),
  ('Faisalabad','faisalabad','Punjab',31.4504,73.1350,true,5),
  ('Multan','multan','Punjab',30.1575,71.5249,true,6),
  ('Peshawar','peshawar','Khyber Pakhtunkhwa',34.0151,71.5249,true,7),
  ('Quetta','quetta','Balochistan',30.1798,66.9750,true,8),
  ('Bahawalpur','bahawalpur','Punjab',29.3956,71.6836,true,9),
  ('Gujranwala','gujranwala','Punjab',32.1877,74.1945,true,10),
  ('Sialkot','sialkot','Punjab',32.4945,74.5229,true,11),
  ('Hyderabad','hyderabad','Sindh',25.3960,68.3578,true,12),
  ('Sargodha','sargodha','Punjab',32.0836,72.6711,false,20),
  ('Sahiwal','sahiwal','Punjab',30.6682,73.1114,false,21),
  ('Jhang','jhang','Punjab',31.2681,72.3181,false,22),
  ('Sheikhupura','sheikhupura','Punjab',31.7167,73.9850,false,23),
  ('Gujrat','gujrat','Punjab',32.5742,74.0754,false,24),
  ('Rahim Yar Khan','rahim-yar-khan','Punjab',28.4202,70.2952,false,25),
  ('Dera Ghazi Khan','dera-ghazi-khan','Punjab',30.0489,70.6402,false,26),
  ('Kasur','kasur','Punjab',31.1187,74.4500,false,27),
  ('Okara','okara','Punjab',30.8081,73.4458,false,28),
  ('Mianwali','mianwali','Punjab',32.5839,71.5436,false,29),
  ('Chiniot','chiniot','Punjab',31.7200,72.9789,false,30),
  ('Hafizabad','hafizabad','Punjab',32.0709,73.6880,false,31),
  ('Khanewal','khanewal','Punjab',30.3017,71.9321,false,32),
  ('Vehari','vehari','Punjab',30.0451,72.3489,false,33),
  ('Burewala','burewala','Punjab',30.1667,72.6500,false,34),
  ('Layyah','layyah','Punjab',30.9693,70.9428,false,35),
  ('Muzaffargarh','muzaffargarh','Punjab',30.0703,71.1933,false,36),
  ('Bahawalnagar','bahawalnagar','Punjab',29.9987,73.2536,false,37),
  ('Lodhran','lodhran','Punjab',29.5393,71.6324,false,38),
  ('Ahmedpur East','ahmedpur-east','Punjab',29.1430,71.2572,false,39),
  ('Hasilpur','hasilpur','Punjab',29.6957,72.5547,false,40),
  ('Yazman','yazman','Punjab',29.1219,71.7447,false,41),
  ('Uch Sharif','uch-sharif','Punjab',29.2333,71.0667,false,42),
  ('Khairpur Tamewali','khairpur-tamewali','Punjab',29.5833,72.2333,false,43),
  ('Pakpattan','pakpattan','Punjab',30.3436,73.3894,false,44),
  ('Toba Tek Singh','toba-tek-singh','Punjab',30.9709,72.4826,false,45),
  ('Nankana Sahib','nankana-sahib','Punjab',31.4500,73.7000,false,46),
  ('Narowal','narowal','Punjab',32.1019,74.8730,false,47),
  ('Mandi Bahauddin','mandi-bahauddin','Punjab',32.5861,73.4917,false,48),
  ('Jhelum','jhelum','Punjab',32.9425,73.7257,false,49),
  ('Attock','attock','Punjab',33.7660,72.3609,false,50),
  ('Chakwal','chakwal','Punjab',32.9328,72.8630,false,51),
  ('Sukkur','sukkur','Sindh',27.7052,68.8574,false,60),
  ('Larkana','larkana','Sindh',27.5570,68.2028,false,61),
  ('Nawabshah','nawabshah','Sindh',26.2483,68.4096,false,62),
  ('Mirpur Khas','mirpur-khas','Sindh',25.5276,69.0111,false,63),
  ('Jacobabad','jacobabad','Sindh',28.2769,68.4514,false,64),
  ('Shikarpur','shikarpur','Sindh',27.9556,68.6382,false,65),
  ('Khairpur Mirs','khairpur-mirs','Sindh',27.5295,68.7592,false,66),
  ('Thatta','thatta','Sindh',24.7461,67.9244,false,67),
  ('Mardan','mardan','Khyber Pakhtunkhwa',34.1989,72.0231,false,70),
  ('Abbottabad','abbottabad','Khyber Pakhtunkhwa',34.1688,73.2215,false,71),
  ('Mingora (Swat)','mingora-swat','Khyber Pakhtunkhwa',34.7717,72.3600,false,72),
  ('Kohat','kohat','Khyber Pakhtunkhwa',33.5869,71.4414,false,73),
  ('Mansehra','mansehra','Khyber Pakhtunkhwa',34.3333,73.2000,false,74),
  ('Dera Ismail Khan','dera-ismail-khan','Khyber Pakhtunkhwa',31.8626,70.9019,false,75),
  ('Bannu','bannu','Khyber Pakhtunkhwa',32.9889,70.6056,false,76),
  ('Nowshera','nowshera','Khyber Pakhtunkhwa',34.0153,71.9747,false,77),
  ('Charsadda','charsadda','Khyber Pakhtunkhwa',34.1453,71.7308,false,78),
  ('Gwadar','gwadar','Balochistan',25.1264,62.3225,false,80),
  ('Turbat','turbat','Balochistan',26.0012,63.0544,false,81),
  ('Khuzdar','khuzdar','Balochistan',27.8000,66.6167,false,82),
  ('Sibi','sibi','Balochistan',29.5430,67.8773,false,83),
  ('Chaman','chaman','Balochistan',30.9210,66.4597,false,84),
  ('Gilgit','gilgit','Gilgit-Baltistan',35.9208,74.3080,false,90),
  ('Skardu','skardu','Gilgit-Baltistan',35.2971,75.6333,false,91),
  ('Muzaffarabad','muzaffarabad','Azad Kashmir',34.3700,73.4711,false,92),
  ('Mirpur (AJK)','mirpur-ajk','Azad Kashmir',33.1478,73.7514,false,93)
on conflict (slug) do nothing;

-- ---------- 5) Purani listings ko naye system mein jorna ----------
update businesses_table b set category_id = c.id
from directory_categories c
where b.category_id is null and c.slug = case b.category
  when 'Doctors' then 'doctors'
  when 'Academies' then 'academies'
  when 'Restaurants' then 'restaurants-food'
  when 'Shops' then 'shops-retail'
  when 'Repair' then 'repair-services'
  when 'Plumber / Electrician' then 'repair-services'
  else 'other' end;

update businesses_table b set subcategory_id = c.id
from directory_categories c
where b.subcategory_id is null and b.category = 'Plumber / Electrician' and c.slug = 'plumbers-electricians';

update businesses_table b set city_id = c.id
from directory_cities c
where b.city_id is null and lower(c.name) = lower(b.area);

-- ---------- 6) Search: nearby + filters + sort (sab database mein) ----------
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
      and (not p_verified_only or b.verification_status = 'verified')
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
            (case when p_sort = 'featured' and f.is_featured then 0 else 1 end) asc,
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

-- ---------- 7) Counting (category / city cards ke liye) ----------
create or replace function directory_counts() returns jsonb
language sql stable security invoker set search_path = public as $$
  select jsonb_build_object(
    'categories', coalesce((
      select jsonb_object_agg(cid::text, n) from (
        select cid, count(*) as n from (
          select category_id as cid from businesses_table where is_active and category_id is not null
          union all
          select subcategory_id from businesses_table where is_active and subcategory_id is not null
        ) x group by cid
      ) y), '{}'::jsonb),
    'cities', coalesce((
      select jsonb_object_agg(city_id::text, n) from (
        select city_id, count(*) as n from businesses_table
        where is_active and city_id is not null group by city_id
      ) z), '{}'::jsonb)
  );
$$;

grant execute on function directory_counts() to anon, authenticated;
