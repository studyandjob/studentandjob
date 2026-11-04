-- Adds the admin show/hide switch for the scrolling news bar.
-- Run once in Supabase → SQL Editor. Default is OFF so no old text appears
-- unexpectedly; turn it on from Admin → Website Settings when you have an alert.
alter table site_settings add column if not exists show_news_ticker boolean default false;
