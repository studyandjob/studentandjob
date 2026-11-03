-- Makes the new Airbnb theme the site-wide theme for every visitor.
-- (Optional: the code already moves anyone on the old default themes to
-- Airbnb; run this to also store it in the database.)
update site_settings set active_theme = 'airbnb', updated_at = now();
