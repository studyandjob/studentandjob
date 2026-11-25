import Link from 'next/link';
import HomeIcon from './HomeIcons';
import Art3D from './Art3D';
import VerifiedBadge from './directory/VerifiedBadge';
import { artFor, businessWaLink, telLink, businessPath, formatDistance, isVerified } from '@/lib/directory';

// Glossy listing card. Works with raw rows or rows passed through
// enrichBusinesses() (adds category_label / city_label). distance_km is
// present for nearby results.
export default function BusinessCard({ business, siteName }) {
  const wa = businessWaLink(business, siteName);
  const tel = telLink(business.phone);
  const href = businessPath(business);
  const category = business.subcategory_label || business.category_label || business.category;
  const place = [business.area_label, business.city_label || business.area].filter(Boolean).join(', ');
  const verified = isVerified(business);
  const distance = formatDistance(business.distance_km);

  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-gradient-to-b from-surface to-surface-alt shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_28px_-14px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_36px_-14px_rgba(0,0,0,0.35)] ${
        verified ? 'border-sky-300/70' : 'border-line'
      }`}
    >
      <Link href={href} className="relative block p-2 pb-0">
        <div className="relative overflow-hidden rounded-2xl">
          {business.photo_url ? (
            // Plain <img> on purpose — public Supabase Storage URL, same as the rest of the site.
            <img src={business.photo_url} alt={business.name} loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-brand-100 via-surface-alt to-brand-50">
              <Art3D name={artFor(business.subcategory_slug || business.category_slug)} className="h-20 w-20 drop-shadow-lg transition duration-500 group-hover:scale-110" />
            </div>
          )}
          {/* glossy sheen */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/10" />
          <div className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-[420%]" />

          {business.is_featured && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
              ★ Featured
            </span>
          )}
          {distance && (
            <span className="absolute right-2.5 top-2.5 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
              {distance}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 pt-3">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          {category && (
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{category}</span>
          )}
          {verified && <VerifiedBadge compact />}
        </div>

        <Link href={href}>
          <h3 className="text-base font-bold leading-snug text-gray-900 hover:underline">{business.name}</h3>
        </Link>

        {business.short_description && <p className="mt-1 line-clamp-2 text-sm text-gray-600">{business.short_description}</p>}
        {place && (
          <p className="mt-1.5 flex items-start gap-1.5 text-sm text-gray-600">
            <HomeIcon name="pin" className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
            <span className="line-clamp-2">{business.address ? `${business.address}, ${place}` : place}</span>
          </p>
        )}
        {business.timing && (
          <p className="mt-1 flex items-start gap-1.5 text-sm text-gray-600">
            <HomeIcon name="clock" className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
            <span className="line-clamp-1">{business.timing}</span>
          </p>
        )}

        <div className="mt-auto flex gap-2 pt-4">
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[42px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_6px_14px_-6px_rgba(5,150,105,0.7)] transition active:scale-95 hover:brightness-105"
            >
              <HomeIcon name="whatsapp" className="h-4 w-4" />
              WhatsApp Order
            </a>
          )}
          {tel && (
            <a
              href={tel}
              className="flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-gray-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition active:scale-95 hover:bg-surface-alt"
            >
              <HomeIcon name="phone" className="h-4 w-4" />
              Call
            </a>
          )}
          {!wa && !tel && (
            <Link
              href={href}
              className="flex min-h-[42px] flex-1 items-center justify-center rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-surface-alt"
            >
              Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
