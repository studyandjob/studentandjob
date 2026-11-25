import Link from 'next/link';
import HomeIcon from './HomeIcons';
import { businessWaLink, telLink, businessPath, formatDistance } from '@/lib/directory';

// Works with raw rows or rows passed through enrichBusinesses() (adds
// category_label / city_label). distance_km is present for nearby results.
export default function BusinessCard({ business, siteName }) {
  const wa = businessWaLink(business, siteName);
  const tel = telLink(business.phone);
  const href = businessPath(business);
  const category = business.subcategory_label || business.category_label || business.category;
  const place = [business.area_label, business.city_label || business.area].filter(Boolean).join(', ');
  const verified = business.verification_status === 'verified';
  const distance = formatDistance(business.distance_km);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all duration-300 hover:shadow-card-hover">
      <Link href={href} className="block">
        {business.photo_url ? (
          // Plain <img> on purpose — public Supabase Storage URL, same as the rest of the site.
          <img src={business.photo_url} alt={business.name} loading="lazy" className="h-44 w-full object-cover" />
        ) : (
          <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50 text-brand-600">
            <HomeIcon name="building" className="h-12 w-12" />
          </div>
        )}
      </Link>

      {business.is_featured && (
        <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-950 shadow">
          ★ Featured
        </span>
      )}
      {distance && (
        <span className="absolute right-3 top-3 rounded-full bg-gray-900/80 px-2.5 py-1 text-xs font-semibold text-white shadow">
          {distance}
        </span>
      )}

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {category && (
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{category}</span>
          )}
          {verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              <HomeIcon name="shield" className="h-3.5 w-3.5" />
              Verified
            </span>
          )}
        </div>

        <Link href={href}>
          <h3 className="text-base font-bold leading-snug text-gray-900 hover:underline">{business.name}</h3>
        </Link>

        {business.short_description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">{business.short_description}</p>
        )}
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
              className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition active:scale-95 hover:bg-emerald-600"
            >
              <HomeIcon name="whatsapp" className="h-4 w-4" />
              WhatsApp Order
            </a>
          )}
          {tel && (
            <a
              href={tel}
              className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-md border border-line px-3 py-2 text-xs font-semibold text-gray-800 transition active:scale-95 hover:bg-surface-alt"
            >
              <HomeIcon name="phone" className="h-4 w-4" />
              Call
            </a>
          )}
          {!wa && !tel && (
            <Link
              href={href}
              className="flex min-h-[40px] flex-1 items-center justify-center rounded-md border border-line px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-surface-alt"
            >
              Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
