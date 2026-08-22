'use client';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CVPreview({ profile }) {
  if (!profile || !profile.full_name) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center text-sm text-gray-500 shadow-sm ring-1 ring-black/5">
        Complete your Profile first — your CV is generated automatically from it.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end print:hidden">
        <button
          onClick={() => window.print()}
          className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Print / Save as PDF
        </button>
      </div>

      {/* Printable CV sheet */}
      <div id="cv-sheet" className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5 print:shadow-none print:ring-0 sm:p-10">
        <header className="mb-6 flex items-center gap-5 border-b border-gray-200 pb-6">
          {profile.photo_url ? (
            <img src={profile.photo_url} alt="" className="h-24 w-24 flex-shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-2xl font-bold text-brand-600">
              {profile.full_name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
            {profile.summary && <p className="mt-1 text-sm text-gray-600">{profile.summary}</p>}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              {profile.phone && <span>📞 {profile.phone}</span>}
              {profile.email && <span>✉️ {profile.email}</span>}
              {profile.city && <span>📍 {profile.city}</span>}
            </div>
          </div>
        </header>

        {profile.education?.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-600">Education</h2>
            <div className="flex flex-col gap-2.5">
              {profile.education.map((ed, i) => (
                <div key={i} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {ed.level} {ed.degree && `— ${ed.degree}`}
                    </p>
                    <p className="text-gray-500">{ed.institute}</p>
                  </div>
                  <div className="flex-shrink-0 text-right text-xs text-gray-500">
                    {ed.year && <p>{ed.year}</p>}
                    {ed.marks && <p>{ed.marks}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.experience?.some((e) => e.title) && (
          <section className="mb-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-600">Experience</h2>
            <div className="flex flex-col gap-3">
              {profile.experience.filter((e) => e.title).map((exp, i) => (
                <div key={i} className="text-sm">
                  <p className="font-semibold text-gray-900">
                    {exp.title} {exp.organization && `— ${exp.organization}`}
                  </p>
                  {exp.duration && <p className="text-xs text-gray-500">{exp.duration}</p>}
                  {exp.description && <p className="mt-1 text-gray-600">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.skills?.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-600">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <span key={s} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
