'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import HomeIcon from '../HomeIcons';
import BusinessCard from '../BusinessCard';
import {
  PAGE_SIZE,
  RADIUS_OPTIONS,
  buildCategoryTree,
  enrichBusinesses,
  nearestCity,
  searchBusinesses,
} from '@/lib/directory';

const fieldClass =
  'w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-sm text-gray-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 disabled:cursor-not-allowed disabled:opacity-50';

/**
 * Search + nearby + filters for the whole directory.
 *  - mode "hub": hero with search; `children` (server-rendered sections) are
 *    shown until the visitor searches, picks a city/category or shares location.
 *  - mode "listing": city / category landing pages; always shows results and
 *    starts from server-rendered `initialData` so Google can read it.
 *
 * Location: asked only when the visitor taps "Mere qareeb" (or has already
 * allowed it in the browser). It is read once — never tracked — kept in memory
 * only, and the nearest city is worked out locally, so exact coordinates are
 * sent nowhere except as search numbers to our own database.
 */
export default function DirectoryExplorer({
  categories = [],
  cities = [],
  areas = [],
  mode = 'hub',
  initialFilters = {},
  initialData = null,
  siteName,
  children,
}) {
  const taxonomy = useMemo(() => ({ categories, cities, areas }), [categories, cities, areas]);
  const tree = useMemo(() => buildCategoryTree(categories), [categories]);

  const [q, setQ] = useState('');
  const [cityId, setCityId] = useState(initialFilters.cityId || '');
  const [areaId, setAreaId] = useState('');
  const [categoryId, setCategoryId] = useState(initialFilters.categoryId || '');
  const [radius, setRadius] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState('featured');
  const [loc, setLoc] = useState(null); // { lat, lng, label } — memory only
  const [geo, setGeo] = useState({ status: 'idle', message: '' });
  const [rows, setRows] = useState(initialData?.rows || []);
  const [total, setTotal] = useState(initialData?.total || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedCity = cities.find((c) => c.id === cityId) || null;
  const cityAreas = useMemo(() => areas.filter((a) => a.city_id === cityId), [areas, cityId]);
  const hasCenter = Boolean(loc || (selectedCity && selectedCity.latitude != null));

  // Radius needs a centre point (GPS, or the chosen city's centre).
  useEffect(() => {
    if (!hasCenter && radius) setRadius('');
  }, [hasCenter, radius]);

  // Remember only the chosen CITY (not coordinates) on the hub.
  useEffect(() => {
    if (mode !== 'hub') return;
    try {
      const saved = localStorage.getItem('dir_city');
      if (saved && cities.some((c) => c.id === saved)) setCityId(saved);
    } catch {}
    // If the browser already has location permission, use it right away.
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

  function changeCity(id) {
    setCityId(id);
    setAreaId('');
    if (mode === 'hub') {
      try {
        id ? localStorage.setItem('dir_city', id) : localStorage.removeItem('dir_city');
      } catch {}
    }
  }

  function locate() {
    if (!('geolocation' in navigator)) {
      setGeo({ status: 'error', message: 'Aap ka browser location support nahi karta. Neeche se shehar chunein.' });
      return;
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
        setAreaId('');
        setSort('nearest');
        setRadius((r) => r || '10');
      },
      (err) => {
        setGeo({
          status: err.code === 1 ? 'denied' : 'error',
          message:
            err.code === 1
              ? 'Location ki ijazat nahi mili. Koi masla nahi — neeche se apna shehar chunein, site poori tarah chalti hai.'
              : 'Location nahi mil saki. Dobara koshish karein ya shehar chunein.',
        });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  function clearLocation() {
    setLoc(null);
    setRadius('');
    setSort('featured');
    setGeo({ status: 'idle', message: '' });
  }

  function resetAll() {
    setQ('');
    changeCity(mode === 'listing' ? initialFilters.cityId || '' : '');
    setCategoryId(mode === 'listing' ? initialFilters.categoryId || '' : '');
    setVerifiedOnly(false);
    clearLocation();
  }

  // ---- filters -> one database call
  function buildFilters(offset) {
    let lat = null;
    let lng = null;
    let cityFilter = cityId || null;
    if (loc) {
      lat = loc.lat;
      lng = loc.lng;
    } else if (radius && selectedCity && selectedCity.latitude != null) {
      // "Within X km of <city>" — centre on the city instead of filtering to it.
      lat = selectedCity.latitude;
      lng = selectedCity.longitude;
      cityFilter = null;
    }
    return {
      lat,
      lng,
      radiusKm: radius && lat != null ? Number(radius) : null,
      cityId: cityFilter,
      areaId: radius && !loc ? null : areaId || null,
      categoryId: categoryId || null,
      q: q.trim(),
      verifiedOnly,
      sort: sort === 'nearest' && lat == null ? 'featured' : sort,
      limit: PAGE_SIZE,
      offset,
    };
  }

  const key = JSON.stringify(buildFilters(0));
  const isActive = Boolean(q.trim() || loc || cityId || categoryId || verifiedOnly || radius);
  const showResults = mode === 'listing' || isActive;
  const lastKey = useRef(initialData ? key : null);

  useEffect(() => {
    if (!showResults || lastKey.current === key) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    const t = setTimeout(
      async () => {
        const res = await searchBusinesses(JSON.parse(key));
        if (cancelled) return;
        lastKey.current = key;
        setLoading(false);
        if (res.error) {
          setError('Results load nahi ho sake. Internet check karke dobara koshish karein.');
          return;
        }
        setRows(res.rows);
        setTotal(res.total);
      },
      q.trim() ? 300 : 0
    );
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, showResults]);

  async function loadMore() {
    setLoading(true);
    const res = await searchBusinesses({ ...JSON.parse(key), offset: rows.length });
    setLoading(false);
    if (res.error) return setError('Mazeed results load nahi ho sake.');
    setRows((prev) => [...prev, ...res.rows]);
    setTotal(res.total);
  }

  const shown = useMemo(() => enrichBusinesses(rows, taxonomy), [rows, taxonomy]);
  const popularCities = cities.filter((c) => c.is_popular);
  const otherCities = cities.filter((c) => !c.is_popular).sort((a, b) => a.name.localeCompare(b.name));

  // ---- shared pieces
  const searchRow = (
    <div className="flex flex-col gap-3 md:flex-row">
      <label className="relative flex-1">
        <span className="sr-only">Search</span>
        <HomeIcon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Hospital, doctor, academy, hotel ya naam search karein..."
          className={`${fieldClass} pl-11`}
        />
      </label>
      <select
        value={cityId}
        onChange={(e) => changeCity(e.target.value)}
        aria-label="Shehar chunein"
        disabled={Boolean(loc)}
        className={`${fieldClass} md:w-56`}
      >
        <option value="">{loc ? `📍 ${loc.label}` : 'Sara Pakistan'}</option>
        {popularCities.length > 0 && (
          <optgroup label="Popular cities">
            {popularCities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </optgroup>
        )}
        <optgroup label="Baqi cities">
          {otherCities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </optgroup>
      </select>
      <button
        type="button"
        onClick={loc ? clearLocation : locate}
        disabled={geo.status === 'asking'}
        className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition active:scale-95 disabled:opacity-60 ${
          loc ? 'border border-line bg-surface text-gray-800 hover:bg-surface-alt' : 'bg-brand-600 text-white hover:bg-brand-700'
        }`}
      >
        <HomeIcon name="pin" className="h-5 w-5" />
        {geo.status === 'asking' ? 'Location dhoond rahe hain...' : loc ? 'Location hatayein' : 'Mere qareeb'}
      </button>
    </div>
  );

  const notices = (
    <>
      {geo.message && (geo.status === 'denied' || geo.status === 'error') && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{geo.message}</p>
      )}
      <p className="mt-3 text-xs text-gray-500">
        🔒 Location sirf aap ki ijazat se, sirf ek dafa istemal hoti hai. Aap ki exact location kisi business ya user ko nahi dikhai jati.
      </p>
    </>
  );

  return (
    <>
      {mode === 'hub' ? (
        <section className="bg-gradient-to-br from-brand-700 to-brand-900 text-white">
          <div className="mx-auto max-w-5xl px-4 py-10 text-center md:px-6 md:py-16">
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Discover Everything Around You</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/85 md:text-base">
              Find Businesses, Services &amp; Places Near You Across Pakistan.
            </p>
            <div className="mt-7 rounded-2xl bg-white/95 p-3 text-left shadow-xl md:p-4 [&_.text-gray-500]:text-gray-500">
              {searchRow}
              {notices}
            </div>
          </div>
        </section>
      ) : (
        <div className="mx-auto max-w-7xl px-4 pt-6 md:px-6">
          {searchRow}
          {notices}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        {!showResults ? (
          children
        ) : (
          <>
            <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-label="Category" className={`${fieldClass} col-span-2`}>
                <option value="">Sab categories</option>
                {tree.map((top) => (
                  <optgroup key={top.id} label={top.name}>
                    <option value={top.id}>Sab {top.name}</option>
                    {top.children.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                disabled={!hasCenter}
                aria-label="Distance"
                title={hasCenter ? '' : 'Pehle "Mere qareeb" dabayein ya shehar chunein'}
                className={fieldClass}
              >
                <option value="">All Pakistan</option>
                {RADIUS_OPTIONS.map((km) => (
                  <option key={km} value={km}>
                    Within {km} KM
                  </option>
                ))}
              </select>

              <select value={areaId} onChange={(e) => setAreaId(e.target.value)} disabled={cityAreas.length === 0 || Boolean(radius && !loc)} aria-label="Area" className={fieldClass}>
                <option value="">{cityAreas.length === 0 ? 'Area' : 'Sab areas'}</option>
                {cityAreas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>

              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort" className={fieldClass}>
                <option value="featured">Featured pehle</option>
                <option value="nearest" disabled={!hasCenter}>
                  Nearest first
                </option>
                <option value="recent">Recently added</option>
              </select>

              <label className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-3 text-sm text-gray-800">
                <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="h-4 w-4 accent-[rgb(var(--brand-600,255_56_92))]" />
                Verified only
              </label>
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{total}</span> business{total === 1 ? '' : 'es'} mile
                {loc && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                    <HomeIcon name="pin" className="h-3.5 w-3.5" />
                    {loc.label}
                    {radius ? ` · ${radius} KM` : ''}
                  </span>
                )}
              </p>
              {isActive && (
                <button type="button" onClick={resetAll} className="text-sm font-semibold text-brand-600 hover:underline">
                  Filters saaf karein
                </button>
              )}
            </div>

            {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            {loading && shown.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-500">Dhoond rahe hain...</p>
            ) : shown.length === 0 ? (
              <div className="rounded-2xl border border-line bg-surface p-10 text-center shadow-card">
                <p className="text-base font-semibold text-gray-700">Koi business nahi mila</p>
                <p className="mt-1.5 text-sm text-gray-500">
                  {radius ? 'Radius barha kar ya "All Pakistan" chun kar dekhein.' : 'Search ya filter badal kar dobara koshish karein.'}
                </p>
                {radius && (
                  <button type="button" onClick={() => setRadius('')} className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                    All Pakistan mein dhoondein
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${loading ? 'opacity-60' : ''}`}>
                  {shown.map((b) => (
                    <BusinessCard key={b.id} business={b} siteName={siteName} />
                  ))}
                </div>
                {shown.length < total && (
                  <div className="mt-8 text-center">
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={loading}
                      className="rounded-md border border-line bg-surface px-6 py-2.5 text-sm font-semibold text-gray-800 hover:bg-surface-alt disabled:opacity-60"
                    >
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
