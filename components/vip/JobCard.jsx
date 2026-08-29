'use client';

import { ChatBubbleIcon3D } from '../Icons3D';

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
            job.job_type === 'Government' ? 'bg-brand-50 text-brand-600' : 'bg-gray-50 text-gray-600'
          }`}
        >
          {job.job_type}
        </span>
        {match && (
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[0.68rem] font-bold text-brand-700">
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

      <p className="mb-4 text-xs font-medium text-red-600">Last date: {formatDate(job.last_date)}</p>

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
            className="flex items-center justify-center rounded-full border border-brand-200 bg-brand-50 px-3 py-2 text-brand-700 transition hover:bg-brand-600 hover:text-white"
            aria-label="WhatsApp Inquiry"
            title="WhatsApp Inquiry"
          >
            <ChatBubbleIcon3D className="h-5 w-5" />
          </a>
        )}
      </div>
    </div>
  );
}
