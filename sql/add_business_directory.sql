-- ============================================================
-- Bahawalpur Local Business Directory + WhatsApp Orders
-- Isko Supabase SQL Editor mein ek dafa run karein. Dobara run karna safe hai.
-- Photos ke liye naya bucket nahi chahiye: pehle se maujood 'site-images'
-- bucket (sql/storage_site_images.sql) use hota hai.
-- ============================================================

create table if not exists businesses_table (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Other',   -- Doctors, Academies, Restaurants, Shops, Repair, Plumber / Electrician, Other
  area text not null default 'Bahawalpur',  -- Bahawalpur, Khairpur Tamewali, Ahmedpur East, ...
  address text,
  phone text,
  whatsapp text,                            -- WhatsApp number (03xx... ya 923xx...)
  timing text,                              -- e.g. "Mon-Sat 9am - 9pm"
  description text,
  services text,                            -- ek line = ek service / menu item
  map_link text,                            -- Google Maps link
  photo_url text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  display_order int default 0,
  created_at timestamptz default now()
);

create index if not exists businesses_table_category_idx on businesses_table (category);
create index if not exists businesses_table_area_idx on businesses_table (area);

alter table businesses_table enable row level security;

-- Website visitors sirf active businesses dekh sakte hain
drop policy if exists "Public can read active businesses" on businesses_table;
create policy "Public can read active businesses"
  on businesses_table for select using (is_active = true);

-- Logged-in admin sab kuch manage kar sakta hai (hidden listings samet)
drop policy if exists "Auth can manage businesses_table" on businesses_table;
create policy "Auth can manage businesses_table"
  on businesses_table for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
