'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import HomeIcon from '../HomeIcons';
import Art3D from '../Art3D';
import BusinessCard from '../BusinessCard';
import { supabase } from '@/lib/supabaseClient';
import {
  HOME_CATEGORY_ORDER,
  PAGE_SIZE,
  RADIUS_OPTIONS,
  artFor,
  buildCategoryTree,
  enrichBusinesses,
  landingPath,
  nearestCity,
  searchBusinesses,
} from '@/lib/directory';

const fieldClass =
  'rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-gray-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none focus:border-brand-600 disabled:opacity-50';

/** One horizontally scrolling row (Airbnb style): title + arrow link, prev/next buttons. */
function Row({ title, subtitle, href, children }) {
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' });
  const circle =
    'hidden h-9 w-9 items-center justify-center rounded-full border border-line bg-gradient-to-b from-surface to-surface-alt text-gray-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_10px_-6px_rgba(0,0,0,0.4)] transition hover:scale-105 md:flex';
  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <Link href={href} className="group inline-flex items-center gap-2 text-xl font-semibold text-gray-900 md:text-2xl">
            <span className="truncate">{title}</span>
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-surface-alt text-gray-900 transition group-hover:translate-x-0.5 group-hover:bg-gray-900 group-hover:text-white">
              <HomeIcon name="arrow" className="h-4 w-4" />
            </span>
          </Link>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => scroll(-1)} aria-label="Pichla" className={circle}>
            <HomeIcon name="chevronLeft" className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Agla" className={circle}>
            <HomeIcon name="chevronRight" className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div ref={ref} className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
  );
}

/**
 * Airbnb-style home page for the directory:
 *   - picks the visitor's location automatically (the browser asks once),
 *   - category tabs with illustrated icons,
 *   - "All" shows one row per service type, nearest first; a tab shows that
 *     category as a grid,
 *   - server-rendered sections (`children`) follow under the "All" tab.
 * Location is read once, kept in memory only — never stored or tracked.
 */
export default function HomeExplorer({ categories = [], cities = [], areas = [], siteName, children }) {
  const taxonomy = useMemo(() => ({ categories, cities, areas }), [categories, cities, areas]);

  const tops = useMemo(() => {
    const all = buildCategoryTree(categories);
    const pref = HOME_CATEGORY_ORDER.map((slug) => all.find((c) => c.slug === slug)).filter(Boolean);
    return [...pref, ...all.filter((c) => !HOME_CATEGORY_ORDER.includes(c.slug) && c.slug !== 'other')];
  }, [categories]);
  const rowCats = tops.filter((c) => HOME_CATEGORY_ORDER.includes(c.slug));

  const [tab, setTab] = useState('all'); // 'all' | category id
  const [loc, setLoc] = useState(null); // { lat, lng, label }
  const [geo, setGeo] = useState({ status: 'idle', message: '' });
  const [cityId, setCityId] = useState('');
  const [radius, setRadius] = useState('50');
  const [rowsData, setRowsData] = useState(null); // { slug: rows[], all: rows[] }
  const [list, setList] = useState({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const selectedCity = cities.find((c) => c.id === cityId) || null;
  const near = loc ? nearestCity(loc.lat, loc.lng, cities) : null;
  const linkCity = loc ? (near && near.km <= 40 ? near.city : null) : selectedCity;
  const where = loc ? ` near ${loc.label}` : selectedCity ? ` in ${selectedCity.name}` : '';
  const activeTab = tops.find((t) => t.id === tab) || null;

  // ---- location (asked automatically once; denied => manual city)
  function locate() {
    if (!('geolocation' in navigator)) {
      return setGeo({ status: 'error', message: 'Aap ka browser location support nahi karta. Shehar chunein.' });
    }
    setGeo({ status: 'asking', message: '' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const n = nearestCity(latitude, longitude, cities);
        setLoc({
          lat: latitude,
          lng: longitude,
          label: n ? (n.km > 30 ? `${n.city.name} ke qareeb` : n.city.name) : 'aap ki location',
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

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dir_city');
      if (saved && cities.some((c) => c.id === saved)) setCityId(saved);
    } catch {}
    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((r) => {
          if (r.state !== 'denied') locate();
          else setGeo({ status: 'denied', message: 'Browser mein location band hai. Apna shehar chunein, ya address bar se location allow karein.' });
        })
        .catch(locate);
    } else {
      locate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // ---- data
  const geoArgs = useMemo(
    () => ({
      lat: loc ? loc.lat : null,
      lng: loc ? loc.lng : null,
      radiusKm: loc && radius ? Number(radius) : null,
      cityId: !loc && cityId ? cityId : null,
    }),
    [loc, radius, cityId]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    (async () => {
      if (tab === 'all') {
        const { data, error: err } = await supabase.rpc('directory_home_rows', {
          p_lat: geoArgs.lat,
          p_lng: geoArgs.lng,
          p_radius_km: geoArgs.radiusKm,
          p_city_id: geoArgs.cityId,
          p_slugs: rowCats.map((c) => c.slug),
          p_per: 10,
        });
        if (cancelled) return;
        if (err) {
          console.warn('directory_home_rows failed (run sql/add_directory_home_rows.sql?):', err.message);
          setError('Results load nahi ho sake. Thori der baad dobara koshish karein.');
        }
        setRowsData(err ? null : data || {});
      } else {
        const res = await searchBusinesses({ ...geoArgs, categoryId: tab, sort: geoArgs.lat != null ? 'nearest' : 'featured', limit: PAGE_SIZE });
        if (cancelled) return;
        if (res.error) setError('Results load nahi ho sake. Thori der baad dobara koshish karein.');
        setList({ rows: res.rows, total: res.total });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, geoArgs]);

  async function loadMore() {
    setLoading(true);
    const res = await searchBusinesses({ ...geoArgs, categoryId: tab, sort: geoArgs.lat != null ? 'nearest' : 'featured', limit: PAGE_SIZE, offset: list.rows.length });
    setLoading(false);
    if (res.error) return setError('Mazeed results load nahi ho sake.');
    setList((p) => ({ rows: [...p.rows, ...res.rows], total: res.total }));
  }

  const rowItems = useMemo(
    () => [
      ...rowCats.map((c) => ({ key: c.slug, title: c.name, slug: c.slug, art: artFor(c.slug), items: enrichBusinesses(rowsData?.[c.slug] || [], taxonomy) })),
      { key: 'all', title: 'All Services', slug: null, art: 'globe', items: enrichBusinesses(rowsData?.all || [], taxonomy) },
    ].filter((r) => r.items.length > 0),
    [rowsData, rowCats, taxonomy]
  );
  const listItems = useMemo(() => enrichBusinesses(list.rows, taxonomy), [list.rows, taxonomy]);

  const popular = cities.filter((c) => c.is_popular);
  const others = cities.filter((c) => !c.is_popular).sort((a, b) => a.name.localeCompare(b.name));

  const widenButton =
    loc && radius ? (
      <button type="button" onClick={() => setRadius('')} className="mt-3 rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-105">
        All Pakistan mein dhoondein
      </button>
    ) : null;

  return (
    <>
      {/* location bar */}
      <div className="mx-auto max-w-[1760px] px-4 pt-4 md:px-10">
        <div className="flex flex-col gap-2 rounded-2xl border border-line bg-gradient-to-b from-surface to-surface-alt p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_20px_-14px_rgba(0,0,0,0.3)] md:flex-row md:items-center md:justify-between md:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <Art3D name="pin" className="h-9 w-9 flex-shrink-0" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {geo.status === 'asking'
                  ? 'Aap ki location dhoond rahe hain...'
                  : loc
                    ? `Aap ke qareeb — ${loc.label}`
                    : selectedCity
                      ? `${selectedCity.name} ki services`
                      : 'Pakistan bhar ki services'}
              </p>
              <p className="truncate text-xs text-gray-500">
                {loc ? 'Nearest pehle · location save ya share nahi hoti' : 'Behtar results ke liye location allow karein ya shehar chunein'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {loc ? (
              <>
                <select value={radius} onChange={(e) => setRadius(e.target.value)} aria-label="Distance" className={fieldClass}>
                  {RADIUS_OPTIONS.map((km) => (
                    <option key={km} value={km}>
                      Within {km} KM
                    </option>
                  ))}
                  <option value="">All Pakistan</option>
                </select>
                <button type="button" onClick={clearLocation} className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-surface-alt">
                  Location hatayein
                </button>
              </>
            ) : (
              <>
                <select value={cityId} onChange={(e) => changeCity(e.target.value)} aria-label="Shehar chunein" className={fieldClass}>
                  <option value="">Sara Pakistan</option>
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
                <button
                  type="button"
                  onClick={locate}
                  disabled={geo.status === 'asking'}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_18px_-8px_rgba(0,0,0,0.5)] transition active:scale-95 hover:brightness-105 disabled:opacity-60"
                >
                  <HomeIcon name="pin" className="h-4 w-4" />
                  {geo.status === 'asking' ? 'Dhoond rahe hain...' : 'Mere qareeb'}
                </button>
              </>
            )}
          </div>
        </div>
        {geo.message && (geo.status === 'denied' || geo.status === 'error') && (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{geo.message}</p>
        )}
      </div>

      {/* category tabs */}
      <div className="mx-auto mt-4 max-w-[1760px] px-4 md:px-10">
        <div role="tablist" aria-label="Categories" className="flex gap-1 overflow-x-auto border-b border-line pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[{ id: 'all', name: 'All', art: 'globe' }, ...tops.map((t) => ({ id: t.id, name: t.name, art: artFor(t.slug) }))].map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`group relative flex min-w-[84px] flex-shrink-0 flex-col items-center gap-1 rounded-t-2xl px-3 pb-3 pt-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 md:min-w-[104px] md:text-sm ${
                  active ? 'bg-gradient-to-b from-transparent to-surface-alt text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Art3D name={t.art} className={`h-10 w-10 transition md:h-12 md:w-12 ${active ? 'drop-shadow-md' : 'opacity-80 group-hover:scale-110 group-hover:opacity-100'}`} />
                <span className="max-w-[96px] text-center leading-tight">{t.name}</span>
                {active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gray-900" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* content */}
      <div className="mx-auto max-w-[1760px] space-y-10 px-4 py-6 md:px-10 md:py-8">
        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        {tab === 'all' ? (
          <>
            {loading && !rowsData ? (
              <p className="py-10 text-center text-sm text-gray-500">Dhoond rahe hain...</p>
            ) : rowItems.length === 0 ? (
              <div className="rounded-3xl border border-line bg-gradient-to-b from-surface to-surface-alt p-10 text-center shadow-card">
                <p className="text-base font-semibold text-gray-700">
                  {loc || cityId ? 'Is jagah abhi koi business listed nahi' : 'Directory jald shuru ho rahi hai'}
                </p>
                <p className="mt-1.5 text-sm text-gray-500">{loc ? 'Radius barha kar dekhein.' : 'Local businesses yahan nazar aane lagenge.'}</p>
                {widenButton}
              </div>
            ) : (
              <div className={`space-y-10 ${loading ? 'opacity-60' : ''}`}>
                {rowItems.map((row) => (
                  <Row
                    key={row.key}
                    title={`${row.title}${where}`}
                    subtitle={loc ? 'Nearest pehle' : selectedCity ? undefined : 'Popular businesses'}
                    href={landingPath(linkCity?.slug, row.slug)}
                  >
                    {row.items.map((b) => (
                      <div key={b.id} className="w-[272px] flex-shrink-0 snap-start sm:w-[292px]">
                        <BusinessCard business={b} siteName={siteName} />
                      </div>
                    ))}
                  </Row>
                ))}
              </div>
            )}
            {children}
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2.5 text-xl font-semibold text-gray-900 md:text-2xl">
                <Art3D name={artFor(activeTab?.slug)} className="h-9 w-9" />
                {activeTab?.name}
                {where}
              </h2>
              <Link href={landingPath(linkCity?.slug, activeTab?.slug)} className="text-sm font-semibold text-brand-600 hover:underline">
                Poora page ›
              </Link>
            </div>

            {loading && listItems.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-500">Dhoond rahe hain...</p>
            ) : listItems.length === 0 ? (
              <div className="rounded-3xl border border-line bg-gradient-to-b from-surface to-surface-alt p-10 text-center shadow-card">
                <p className="text-base font-semibold text-gray-700">Is category mein abhi koi business nahi mila</p>
                {widenButton}
              </div>
            ) : (
              <>
                <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 ${loading ? 'opacity-60' : ''}`}>
                  {listItems.map((b) => (
                    <BusinessCard key={b.id} business={b} siteName={siteName} />
                  ))}
                </div>
                {listItems.length < list.total && (
                  <div className="text-center">
                    <button type="button" onClick={loadMore} disabled={loading} className="rounded-xl border border-line bg-surface px-6 py-2.5 text-sm font-semibold text-gray-800 hover:bg-surface-alt disabled:opacity-60">
                      {loading ? 'Load ho raha hai...' : 'Mazeed dikhayein'}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
