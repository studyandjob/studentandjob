-- ============================================================
-- Paid WhatsApp Application-Support Service (v6)
-- Run this AFTER sql/add_homepage_stats_boost.sql in the Supabase SQL Editor.
-- Safe to re-run (uses IF NOT EXISTS throughout).
--
-- This is a brand-new, admin-controlled paid service: candidates pay to
-- have someone help them fill/submit a job application over WhatsApp.
-- Everything about it — whether it's shown at all, price, what's
-- included, refund/terms, and the WhatsApp number — is edited from
-- Admin → WhatsApp Service, never hardcoded in the site's code.
-- ============================================================

alter table site_settings add column if not exists wa_service_enabled boolean not null default false;
alter table site_settings add column if not exists wa_service_title text default 'Application Support via WhatsApp';
alter table site_settings add column if not exists wa_service_price text;                -- free text, e.g. "Rs. 500 per application"
alter table site_settings add column if not exists wa_service_description text;          -- short paragraph explaining the service
alter table site_settings add column if not exists wa_service_features text;             -- one "what's included" bullet per line
alter table site_settings add column if not exists wa_service_terms text;                -- refund policy / terms & conditions, shown in full before payment
alter table site_settings add column if not exists wa_service_whatsapp_number text;       -- e.g. 923001234567 (service inquiries — can differ from a job's own whatsapp_number)
alter table site_settings add column if not exists wa_service_cta_text text default 'Chat on WhatsApp';

comment on column site_settings.wa_service_enabled is 'Master on/off switch for the paid WhatsApp application-support service across the whole public site.';
comment on column site_settings.wa_service_price is 'Displayed prominently next to the service — always shown alongside the terms/refund policy, never hidden.';
comment on column site_settings.wa_service_terms is 'Refund and terms & conditions text for the paid service — shown on the public service page and linked wherever the service is offered.';
