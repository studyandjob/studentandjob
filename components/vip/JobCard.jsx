'use client';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function JobCard({ job, match, onViewDetails }) {
  return (
    <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide ${
            job.job_type === 'Government' ? 'bg-brand-50 text-brand-600' : 'bg-amber-50 text-amber-600'
          }`}
        >
          {job.job_type}
        </span>
        {match && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[0.68rem] font-bold text-emerald-700">
            {match.score}% Match
          </span>
        )}
      </div>

      <h3 className="mb-1 line-clamp-2 text-base font-bold text-gray-900">{job.title}</h3>
      <p className="mb-3 text-xs text-gray-500">
        {job.department} {job.city ? `• ${job.city}` : ''}
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[0.68rem] text-gray-600">{job.sector}</span>
        {job.category && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[0.68rem] text-gray-600">{job.category}</span>}
      </div>

      <p className="mb-4 text-xs font-medium text-rose-600">Last date: {formatDate(job.last_date)}</p>

      <div className="mt-auto flex gap-2">
        <button
          onClick={onViewDetails}
          className="flex-1 rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
        >
          View Details
        </button>
        {job.whatsapp_number && (
          <a
            href={`https://wa.me/${job.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(`I'm interested in the ${job.title} position.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
            aria-label="WhatsApp Inquiry"
            title="WhatsApp Inquiry"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.09c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.13.11-1.83-.12-.42-.13-.96-.31-1.66-.6-2.92-1.26-4.83-4.2-4.98-4.4-.14-.19-1.19-1.58-1.19-3.02s.75-2.14 1.02-2.43c.26-.29.58-.36.77-.36h.55c.18 0 .42-.03.65.5.24.55.81 1.9.88 2.04.07.14.11.31.02.5-.09.19-.14.31-.28.48-.14.16-.29.36-.42.48-.14.14-.28.28-.12.55.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.68-.79.86-1.06.18-.28.36-.23.6-.14.24.09 1.55.73 1.82.87.27.14.44.2.51.31.07.12.07.68-.17 1.36z" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
