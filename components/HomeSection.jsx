import Link from 'next/link';
import HomeIcon from './HomeIcons';

/** Airbnb-style section heading: bold title on the left, "Show all ›" on the right. */
export default function HomeSection({ title, href, linkLabel = 'Show all', children, className = '' }) {
  return (
    <section className={className}>
      <div className="mb-4 flex items-end justify-between gap-3 md:mb-5">
        <h2 className="text-xl font-bold leading-tight text-gray-900 md:text-2xl">{title}</h2>
        {href && (
          <Link
            href={href}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold text-gray-900 underline-offset-4 transition hover:bg-gray-100 hover:underline"
          >
            {linkLabel}
            <HomeIcon name="chevronRight" className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
