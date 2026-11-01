-- "Online Jobs" update: page on/off switches + ad settings.
-- Run once in the Supabase SQL Editor. Safe to re-run.
alter table site_settings
  add column if not exists page_visibility jsonb default '{}'::jsonb,
  add column if not exists ad_gate_enabled boolean default false,
  add column if not exists ad_gate_seconds integer default 5,
  add column if not exists ad_gate_max_per_session integer default 0,
  add column if not exists ad_gate_code text default '',
  add column if not exists ad_head_code text default '',
  add column if not exists ad_code_top text default '',
  add column if not exists ad_code_middle text default '',
  add column if not exists ad_code_bottom text default '',
  add column if not exists ad_code_list text default '',
  add column if not exists ads_txt text default '';
