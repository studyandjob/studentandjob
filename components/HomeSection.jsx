import Link from 'next/link';

/** Section heading with a brass bar on the left; marks a new block of content. */
export default function HomeSection({ title, href, linkLabel = 'View all', children, className = '' }) {
  return (
    <section className={className}>
      <div className="mb-3 flex items-end justify-between gap-3 border-b border-gray-300 pb-2">
        <h2 className="border-l-4 border-accent-500 pl-3 font-serif text-xl font-bold leading-tight text-brand-900 md:text-2xl">
          {title}
        </h2>
        {href && (
          <Link href={href} className="whitespace-nowrap text-sm font-semibold text-brand-700 hover:underline">
            {linkLabel}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
