import { StarIcon3D } from './Icons3D';

function Avatar({ name, imageUrl }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="h-11 w-11 flex-shrink-0 rounded-full object-cover ring-2 ring-brand-100"
      />
    );
  }
  return (
    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-base font-bold text-brand-700 ring-2 ring-brand-100">
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

export default function Testimonials({ testimonials = [] }) {
  // Nothing fabricated: if the admin hasn't added real success stories yet,
  // this section simply doesn't render rather than showing placeholder
  // quotes attributed to made-up people.
  if (testimonials.length === 0) return null;

  return (
    <div className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="mb-6 text-center md:mb-8">
          <h2 className="font-serif text-xl font-bold text-gray-900 md:text-2xl">Success Stories</h2>
          <p className="mt-1 text-sm text-gray-500">Real students and job seekers who found their next step here.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.slice(0, 6).map((t) => (
            <figure
              key={t.id}
              className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ring-1 ring-black/5"
            >
              {t.rating > 0 && (
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon3D key={i} className={`h-4 w-4 ${i < t.rating ? '' : 'opacity-20'}`} />
                  ))}
                </div>
              )}
              <blockquote className="flex-1 text-sm leading-relaxed text-gray-700">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="flex items-center gap-3 border-t border-gray-100 pt-3">
                <Avatar name={t.name} imageUrl={t.avatar_url} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-900">{t.name}</p>
                  {t.role && <p className="truncate text-xs text-gray-500">{t.role}</p>}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
