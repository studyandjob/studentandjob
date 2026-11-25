'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import HomeIcon from '../HomeIcons';
import BusinessCard from '../BusinessCard';
import { supabase } from '@/lib/supabaseClient';
import { RADIUS_OPTIONS, enrichBusinesses, landingPath, nearestCity } from '@/lib/directory';

// Rows shown on the home page, in this order. `slug` = directory category.
const ROWS = [
  { slug: 'schools', label: 'Schools' },
  { slug: 'colleges-universities', label: 'Colleges & Universities' },
  { slug: 'academies', label: 'Academies' },
  { slug: 'hospitals', label: 'Hospitals' },
  { slug: 'hotels-accommodation', label: 'Hotels' },
  { slug: 'doctors', label: 'Doctors' },
  { slug: 'advocates-legal', label: 'Advocates' },
];

const fieldClass =
  'rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-600 disabled:opacity-50';

/**
 * Home page "Aap ke qareeb": asks for location (only on a tap, or when the
 * browser already allows it), then shows one scrollable row per service type,
 * nearest first, plus a final "All Services" row. Without location it shows
 * the selected city's listings (or featured ones across Pakistan).
 * Location is read once, kept in memory only, and never stored or tracked.
 */
export default function NearbyServices({ categories = [], cities = [], areas = [], siteName }) {
  const taxonomy = useMemo(() => ({ categories, cities, areas }), [categories, cities, areas]);
  const [loc, setLoc] = useState(null); // { lat, lng, label }
  const [cityId, setCityId] = useState('');
  const [radius, setRadius] = useState('50');
  const [geo, setGeo] = useState({ status: 'idle', message: '' });
  const [data, setData] = useState(null); // { slug: rows[], all: rows[] }
  const [loading, setLoading] = useState(true);

  const selectedCity = cities.find((c) => c.id === cityId) || null;
  const nearCity = loc ? nearestCity(loc.lat, loc.lng, cities) : null;
  const linkCity = loc ? (nearCity && nearCity.km <= 40 ? nearCity.city : null) : selectedCity;

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dir_city');
      if (saved && cities.some((c) => c.id === saved)) setCityId(saved);
    } catch {}
    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((r) => {
          if (r.state === 'granted') locate();
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function locate() {
    if (!('geolocation' in navigator)) {
      return setGeo({ status: 'error', message: 'Aap ka browser location support nahi karta. Shehar chunein.' });
    }
    setGeo({ status: 'asking', message: '' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const near = nearestCity(latitude, longitude, cities);
        setLoc({
          lat: latitude,
          lng: longitude,
          label: near ? (near.km > 30 ? `${near.city.name} ke qareeb` : near.city.name) : 'Aap ki location',
        });
        setGeo({ status: 'granted', message: '' });
        setCityId('');
      },
      (err) =>
        setGeo({
          status: err.code === 1 ? 'denied' : 'error',
          message:
            err.code === 1
              ? 'Location ki ijazat nahi mili. Koi masla nahi — apna shehar chunein.'
              : 'Location nahi mil saki. Dobara koshish karein ya shehar chunein.',
        }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  function clearLocation() {
    setLoc(null);
    setGeo({ status: 'idle', message: '' });
  }

  function changeCity(id) {
    setCityId(id);
    try {
      id ? localStorage.setItem('dir_city', id) : localStorage.removeItem('dir_city');
    } catch {}
  }

  // One database call for every row.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data: rows, error } = await supabase.rpc('directory_home_rows', {
        p_lat: loc ? loc.lat : null,
        p_lng: loc ? loc.lng : null,
        p_radius_km: loc && radius ? Number(radius) : null,
        p_city_id: !loc && cityId ? cityId : null,
        p_slugs: ROWS.map((r) => r.slug),
        p_per: 10,
      });
      if (cancelled) return;
      if (error) console.warn('directory_home_rows failed (run sql/add_directory_home_rows.sql?):', error.message);
      setData(error ? null : rows || {});
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loc, radius, cityId]);

  const rowsToShow = [
    ...ROWS.map((r) => ({ ...r, items: enrichBusinesses(data?.[r.slug] || [], taxonomy) })),
    { slug: null, label: 'All Services', items: enrichBusinesses(data?.all || [], taxonomy) },
  ].filter((r) => r.items.length > 0);

  // Nothing to show and the visitor hasn't asked for anything -> keep the home page clean.
  if (!loading && rowsToShow.length === 0 && !loc && !cityId && geo.status === 'idle') return null;

  const popular = cities.filter((c) => c.is_popular);
  const others = cities.filter((c) => !c.is_popular).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section aria-labelledby="nearby-title" className="rounded-2xl border border-line bg-surface p-4 shadow-card md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="nearby-title" className="text-xl font-bold text-gray-900 md:text-2xl">
            {loc ? `Aap ke qareeb — ${loc.label}` : selectedCity ? `${selectedCity.name} ki services` : 'Aap ke qareeb ki services'}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">Schools, hospitals, doctors, hotels aur mazeed — nearest pehle.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loc ? clearLocation : locate}
            disabled={geo.status === 'asking'}
            className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-95 disabled:opacity-60 ${
              loc ? 'border border-line bg-surface text-gray-800 hover:bg-surface-alt' : 'bg-brand-600 text-white hover:bg-brand-700'
            }`}
          >
            <HomeIcon name="pin" className="h-4 w-4" />
            {geo.status === 'asking' ? 'Dhoond rahe hain...' : loc ? 'Location hatayein' : 'Mere qareeb dikhayein'}
          </button>

          {!loc && (
            <select value={cityId} onChange={(e) => changeCity(e.target.value)} aria-label="Shehar chunein" className={fieldClass}>
              <option value="">Shehar chunein</option>
              {popular.length > 0 && (
                <optgroup label="Popular cities">
                  {popular.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Baqi cities">
                {others.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            </select>
          )}

          {loc && (
            <select value={radius} onChange={(e) => setRadius(e.target.value)} aria-label="Distance" className={fieldClass}>
              {RADIUS_OPTIONS.map((km) => (
                <option key={km} value={km}>
                  Within {km} KM
                </option>
              ))}
              <option value="">All Pakistan</option>
            </select>
          )}
        </div>
      </div>

      {geo.message && (geo.status === 'denied' || geo.status === 'error') && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{geo.message}</p>
      )}
      <p className="mt-2 text-xs text-gray-500">
        🔒 Location sirf aap ki ijazat se, sirf ek dafa istemal hoti hai — save ya share nahi hoti.
      </p>

      {loading && !data ? (
        <p className="py-10 text-center text-sm text-gray-500">Dhoond rahe hain...</p>
      ) : rowsToShow.length === 0 ? (
        <div className="mt-6 rounded-xl border border-line bg-surface-alt p-8 text-center">
          <p className="text-sm font-semibold text-gray-700">Is jagah ke qareeb abhi koi business listed nahi</p>
          {loc && radius && (
            <button type="button" onClick={() => setRadius('')} className="mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              All Pakistan mein dhoondein
            </button>
          )}
        </div>
      ) : (
        <div className={`mt-6 flex flex-col gap-8 ${loading ? 'opacity-60' : ''}`}>
          {rowsToShow.map((row) => (
            <div key={row.slug || 'all'}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-900">{row.label}</h3>
                <Link
                  href={landingPath(linkCity?.slug, row.slug)}
                  className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold text-gray-900 hover:bg-surface-alt hover:underline"
                >
                  Sab dekhein ›
                </Link>
              </div>
              <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
                {row.items.map((b) => (
                  <div key={b.id} className="w-[270px] flex-shrink-0 snap-start sm:w-[290px]">
                    <BusinessCard business={b} siteName={siteName} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
