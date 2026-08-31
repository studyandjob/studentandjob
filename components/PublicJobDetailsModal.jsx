'use client';

import { CloseIcon3D } from './Icons3D';
import WhatsAppServiceCard from './WhatsAppServiceCard';

function formatDate(dateStr) {
  if (!dateStr) return 'Not specified';
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isPastLastDate(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

function Row({ label, value, danger }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[0.7rem] font-semibold uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className={`mt-0.5 text-sm ${danger ? 'font-bold text-red-600' : 'text-gray-800'}`}>{value}</dd>
    </div>
  );
}

function TagGroup({ label, tags }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
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

export default function PublicJobDetailsModal({ job, settings, onClose }) {
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
                className={`rounded-full px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wide ${
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
            <CloseIcon3D className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-6 px-5 py-5 sm:px-6">
          {/* Official Source strip — always visible so candidates can verify the job themselves */}
          <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5">
            {job.source_type && job.verified_on ? (
              <p className="text-sm font-bold text-emerald-700">✓ Official Source Verified</p>
            ) : (
              <p className="text-sm font-bold text-amber-700">⚠ Not yet verified against an official source</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span>
                <span className="font-semibold text-amber-700">Source: </span>
                <span className="text-amber-900">{job.source_type || 'Not specified'}</span>
              </span>
              {job.verified_on && (
                <span>
                  <span className="font-semibold text-amber-700">Verified On: </span>
                  <span className="text-amber-900">{formatDate(job.verified_on)}</span>
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {job.official_website ? (
                <a
                  href={job.official_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-amber-800 underline decoration-amber-400 underline-offset-2"
                >
                  Official Website
                </a>
              ) : (
                <span className="text-sm text-amber-800">Official Website not linked</span>
              )}
              {job.ad_image_url && (
                <a
                  href={job.ad_image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-amber-800 underline decoration-amber-400 underline-offset-2"
                >
                  Official Advertisement
                </a>
              )}
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Row label="Organization" value={job.department} />
            <Row label="Job Type" value={job.job_type} />
            <Row label="Location" value={job.city} />
            <Row label="Sector" value={job.sector} />
            <Row label="Category" value={job.category} />
            <Row label="Salary" value={job.salary} />
            <Row label="Number of Vacancies" value={job.vacancies} />
            <Row label="Age Limit" value={job.age_limit} />
            <Row label="Experience" value={job.experience_required} />
            <Row label="Application Mode" value={job.application_mode} />
            <Row label="Last Date to Apply" value={formatDate(job.last_date)} danger={isPastLastDate(job.last_date)} />
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
                    <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-gray-600">
                      Postal Address
                    </p>
                    <p className="mt-0.5 text-gray-900">{job.postal_address}</p>
                  </div>
                )}
                {job.required_documents && (
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-gray-600">
                      Required Documents
                    </p>
                    <p className="mt-0.5 whitespace-pre-line text-gray-900">{job.required_documents}</p>
                  </div>
                )}
                {job.fee_details && (
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-gray-600">
                      Fee / Challan Details
                    </p>
                    <p className="mt-0.5 text-gray-900">{job.fee_details}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {settings?.wa_service_enabled && <WhatsAppServiceCard settings={settings} compact />}
        </div>

        {/* Footer — Apply Now is the dominant, full-width action on mobile
            (it's why the candidate opened this modal); Official Website,
            WhatsApp and Close sit together as a smaller secondary row
            underneath, then sit inline next to Apply Now on desktop. */}
        <div className="sticky bottom-0 flex flex-col gap-2 border-t border-gray-100 bg-white px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:px-6">
          {job.apply_link && (
            <a
              href={job.apply_link}
              target="_blank"
              rel="noopener noreferrer"
              className="order-1 w-full rounded-full bg-brand-600 px-5 py-3.5 text-center text-sm font-bold text-white shadow-md shadow-brand-600/20 transition active:scale-[0.98] hover:bg-brand-700 sm:w-auto sm:py-2.5 sm:font-semibold"
            >
              Apply Now
            </a>
          )}
          <div className="order-2 flex flex-wrap gap-2">
            {job.official_website && (
              <a
                href={job.official_website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 transition active:scale-[0.98] hover:border-brand-300 hover:text-brand-700 sm:flex-none"
              >
                Official Website
              </a>
            )}
            {job.whatsapp_number && (
              <a
                href={`https://wa.me/${job.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `I'm interested in the ${job.title} position.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-full border border-brand-200 bg-brand-50 px-4 py-2.5 text-center text-sm font-semibold text-brand-700 transition active:scale-[0.98] hover:bg-brand-600 hover:text-white sm:flex-none"
              >
                WhatsApp Inquiry
              </a>
            )}
            <button
              onClick={onClose}
              className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-center text-sm font-semibold text-gray-600 transition hover:text-gray-900 sm:flex-none"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
