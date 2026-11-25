-- ============================================================
-- Home page "Aap ke qareeb" rows — ek hi call mein sab categories
-- Pehle add_directory_phase1.sql run honi chahiye. Safe to re-run.
-- ============================================================

create or replace function directory_home_rows(
  p_lat double precision default null,
  p_lng double precision default null,
  p_radius_km double precision default null,
  p_city_id uuid default null,
  p_slugs text[] default '{}',
  p_per int default 10
) returns jsonb
language plpgsql stable security invoker set search_path = public as $$
declare
  result jsonb := '{}'::jsonb;
  s text;
  cid uuid;
  v_sort text := case when p_lat is not null and p_lng is not null then 'nearest' else 'featured' end;
begin
  foreach s in array coalesce(p_slugs, '{}') loop
    select id into cid from directory_categories where slug = s and is_active limit 1;
    if cid is not null then
      result := result || jsonb_build_object(
        s, directory_search(p_lat, p_lng, p_radius_km, p_city_id, null, cid, null, false, v_sort, p_per, 0) -> 'rows');
    end if;
  end loop;

  -- "All services": sab categories mila kar
  result := result || jsonb_build_object(
    'all', directory_search(p_lat, p_lng, p_radius_km, p_city_id, null, null, null, false, v_sort, p_per, 0) -> 'rows');

  return result;
end $$;

grant execute on function directory_home_rows(double precision, double precision, double precision, uuid, text[], int) to anon, authenticated;
