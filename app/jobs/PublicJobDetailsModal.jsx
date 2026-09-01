'use client';

function formatDate(dateStr) {
  if (!dateStr) return 'Not specified';
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-800">{value}</dd>
    </div>
  );
}

function TagGroup({ label, tags }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function PublicJobDetailsModal({ job, onClose }) {
  if (!job) return null;
  const showManual = job.job_type === 'Government' || job.application_mode === 'Manual/By Post';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-gray-100 bg-white px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">{job.title}</h2>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
                  job.job_type === 'Government' ? 'bg-brand-50 text-brand-700' : 'bg-gray-50 text-gray-600'
                }`}
              >
                {job.job_type}
              </span>
            </div>
            <p className="text-sm text-gray-500">{job.department || 'Department not specified'}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-6 px-5 py-5 sm:px-6">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Row label="Sector" value={job.sector} />
            <Row label="Category" value={job.category} />
            <Row label="City" value={job.city} />
            <Row label="Application Mode" value={job.application_mode} />
            <Row label="Last Date to Apply" value={formatDate(job.last_date)} />
          </dl>

          {(job.education_required?.length > 0 || job.skills_required?.length > 0) && (
            <div className="grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
              <TagGroup label="Education Required" tags={job.education_required} />
              <TagGroup label="Skills Required" tags={job.skills_required} />
            </div>
          )}

          {showManual && (job.postal_address || job.required_documents || job.fee_details) && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="mb-3 text-sm font-semibold text-gray-800">Manual / By-Post Details</p>
              <div className="flex flex-col gap-3 text-sm">
                {job.postal_address && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Postal Address
                    </p>
                    <p className="mt-0.5 text-gray-900">{job.postal_address}</p>
                  </div>
                )}
                {job.required_documents && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Required Documents
                    </p>
                    <p className="mt-0.5 whitespace-pre-line text-gray-900">{job.required_documents}</p>
                  </div>
                )}
                {job.fee_details && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Fee / Challan Details
                    </p>
                    <p className="mt-0.5 text-gray-900">{job.fee_details}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {job.ad_image_url && (
            <a
              href={job.ad_image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-brand-600 hover:underline"
            >
              View Job Advertisement (Image/PDF) →
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-gray-100 bg-white px-5 py-4 sm:px-6">
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
              href={`https://wa.me/${job.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(
                `I'm interested in the ${job.title} position.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-brand-200 bg-brand-50 px-5 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-600 hover:text-white"
            >
              WhatsApp Inquiry
            </a>
          )}
          <button
            onClick={onClose}
            className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:text-gray-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
