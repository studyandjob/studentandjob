-- Lets a Hero Slide be a YouTube video instead of an image. Run this in
-- Supabase → SQL Editor (safe to re-run).
--
-- After this, a hero_slides row can have EITHER image_url OR video_url set
-- (the admin form only requires one of the two). image_url's old NOT NULL
-- constraint is dropped so video-only slides can be saved.

alter table hero_slides add column if not exists video_url text;
alter table hero_slides alter column image_url drop not null;
