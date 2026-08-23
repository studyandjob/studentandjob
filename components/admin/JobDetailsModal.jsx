'use client';

import { CloseIcon, BriefcaseIcon } from './icons';

function formatDate(dateStr) {
  if (!dateStr) return 'Not specified';
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[0.7rem] font-semibold uppercase tracking-wide text-amuted">{label}</dt>
      <dd className="mt-0.5 text-sm text-aink">{value}</dd>
    </div>
  );
}

function TagGroup({ label, tags }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-amuted">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="rounded-full bg-atl/10 px-2.5 py-1 text-xs font-medium text-atl">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function JobDetailsModal({ job, onClose, onEdit }) {
  if (!job) return null;

  const showManual = job.job_type === 'Government' || job.application_mode === 'Manual/By Post';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[16px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-aline bg-white px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-atl/10 text-atl">
              <BriefcaseIcon className="h-5 w-5" />
            </span>
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-aink">{job.title}</h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wide ${
                    job.job_type === 'Government' ? 'bg-atl/10 text-atl' : 'bg-agold/15 text-agold'
                  }`}
                >
                  {job.job_type}
                </span>
                {job.status === 'closed' && (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[0.68rem] font-bold text-rose-600">
                    Closed
                  </span>
                )}
              </div>
              <p className="text-sm text-amuted">{job.department || 'Department not specified'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-full p-1.5 text-amuted transition hover:bg-aline/60 hover:text-aink"
            aria-label="Close"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-6 px-6 py-5">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Row label="Sector" value={job.sector} />
            <Row label="Category" value={job.category} />
            <Row label="City" value={job.city} />
            <Row label="Application Mode" value={job.application_mode} />
            <Row label="Last Date to Apply" value={formatDate(job.last_date)} />
            <Row label="Posted On" value={formatDate(job.created_at)} />
          </dl>

          {(job.apply_link || job.whatsapp_number) && (
            <div className="flex flex-wrap gap-3 border-t border-aline pt-4">
              {job.apply_link && (
                <a
                  href={job.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-atl px-4 py-2 text-xs font-semibold text-white transition hover:bg-atl2"
                >
                  Open Official Apply Link ↗
                </a>
              )}
              {job.whatsapp_number && (
                <span className="flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                  WhatsApp: {job.whatsapp_number}
                </span>
              )}
              {job.ad_image_url && (
                <a
                  href={job.ad_image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-aline px-4 py-2 text-xs font-semibold text-amuted transition hover:text-aink"
                >
                  View Ad Image / PDF ↗
                </a>
              )}
            </div>
          )}

          {(job.education_required?.length > 0 || job.skills_required?.length > 0) && (
            <div className="grid grid-cols-1 gap-4 rounded-[12px] bg-atl/5 p-4 sm:grid-cols-2">
              <TagGroup label="Education Required" tags={job.education_required} />
              <TagGroup label="Skills Required" tags={job.skills_required} />
            </div>
          )}

          {showManual && (job.postal_address || job.required_documents || job.fee_details) && (
            <div className="rounded-[12px] border border-agold/40 bg-agold/5 p-4">
              <p className="mb-3 text-sm font-semibold text-atl">Manual / By-Post Details</p>
              <div className="flex flex-col gap-3 text-sm">
                {job.postal_address && (
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-amuted">Postal Address</p>
                    <p className="mt-0.5 text-aink">{job.postal_address}</p>
                  </div>
                )}
                {job.required_documents && (
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-amuted">
                      Required Documents
                    </p>
                    <p className="mt-0.5 whitespace-pre-line text-aink">{job.required_documents}</p>
                  </div>
                )}
                {job.fee_details && (
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-amuted">
                      Fee / Challan Details
                    </p>
                    <p className="mt-0.5 text-aink">{job.fee_details}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-aline bg-white px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-full border border-aline px-5 py-2.5 text-sm font-semibold text-amuted transition hover:text-aink"
          >
            Close
          </button>
          {onEdit && (
            <button
              onClick={onEdit}
              className="rounded-full bg-atl px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-atl2"
            >
              Edit Job
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
