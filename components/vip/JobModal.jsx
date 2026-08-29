'use client';

function formatDate(dateStr) {
  if (!dateStr) return 'Not specified';
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function JobModal({ job, match, onClose }) {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
            <p className="text-sm text-gray-500">{job.department}</p>
          </div>
          <button onClick={onClose} className="flex-shrink-0 text-2xl leading-none text-gray-400 hover:text-gray-700">
            ×
          </button>
        </div>

        {match && (
          <div className="mb-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
            <strong>{match.score}% match</strong>
            {match.reasons.length > 0 && <span> — {match.reasons.join('; ')}</span>}
          </div>
        )}

        <dl className="mb-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-gray-400">Sector</dt>
            <dd className="font-medium text-gray-800">{job.sector}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">Type</dt>
            <dd className="font-medium text-gray-800">{job.job_type}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">City</dt>
            <dd className="font-medium text-gray-800">{job.city || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">Last Date</dt>
            <dd className="font-medium text-red-600">{formatDate(job.last_date)}</dd>
          </div>
        </dl>

        {job.education_required?.length > 0 && (
          <div className="mb-3">
            <p className="mb-1 text-xs font-semibold text-gray-500">Education Required</p>
            <div className="flex flex-wrap gap-1.5">
              {job.education_required.map((e) => (
                <span key={e} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                  {e}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.skills_required?.length > 0 && (
          <div className="mb-3">
            <p className="mb-1 text-xs font-semibold text-gray-500">Skills Required</p>
            <div className="flex flex-wrap gap-1.5">
              {job.skills_required.map((s) => (
                <span key={s} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.ad_image_url && (
          <a href={job.ad_image_url} target="_blank" rel="noopener noreferrer" className="mb-3 block text-sm font-semibold text-brand-600 hover:underline">
            View Job Advertisement →
          </a>
        )}

        {(job.postal_address || job.required_documents || job.fee_details) && (
          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-900">
            {job.postal_address && (
              <p className="mb-1">
                <strong>Postal Address:</strong> {job.postal_address}
              </p>
            )}
            {job.required_documents && (
              <p className="mb-1 whitespace-pre-line">
                <strong>Required Documents:</strong>
                {'\n'}
                {job.required_documents}
              </p>
            )}
            {job.fee_details && (
              <p>
                <strong>Fee Details:</strong> {job.fee_details}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {job.apply_link && (
            <a
              href={job.apply_link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Apply Now
            </a>
          )}
          {job.whatsapp_number && (
            <a
              href={`https://wa.me/${job.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(`I'm interested in the ${job.title} position.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-brand-300 bg-brand-50 px-5 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-600 hover:text-white"
            >
              WhatsApp Inquiry
            </a>
          )}
          <button onClick={onClose} className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
