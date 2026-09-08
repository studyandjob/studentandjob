import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import PublicJobCard from '@/components/PublicJobCard';
import JobShareButton from '@/components/JobShareButton';
import WhatsAppServiceCard from '@/components/WhatsAppServiceCard';
import { getSiteSettings, getJobById, getRelatedJobs } from '@/lib/data';
import { isDatePast, daysRemaining } from '@/lib/jobStatus';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://onlinejobsandstudy.vercel.app';

function formatDate(dateStr) {
  if (!dateStr) return 'Not specified';
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Short, honest meta description built from real job fields — never invents details the admin didn't enter. */
function buildMetaDescription(job) {
  if (job.description) return job.description.slice(0, 155);
  const parts = [
    job.department && `at ${job.department}`,
    job.city && `in ${job.city}`,
    job.last_date && `Apply before ${formatDate(job.last_date)}`,
  ].filter(Boolean);
  return `${job.title} ${parts.join(' — ')}.`.slice(0, 155);
}

export async function generateMetadata({ params }) {
  const job = await getJobById(params.id);
  if (!job) return { title: 'Job Not Found' };

  const settings = await getSiteSettings();
  const siteName = settings.site_name || 'Education & Job Portal';
  const description = buildMetaDescription(job);
  const ogImage = job.ad_image_url || settings.logo_url || undefined;

  return {
    title: `${job.title} — ${job.department || siteName}`,
    description,
    alternates: { canonical: `/jobs/${job.id}` },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'article',
      url: `/jobs/${job.id}`,
      siteName,
      title: job.title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: job.title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function Row({ label, value, danger }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className={`mt-0.5 text-sm ${danger ? 'font-bold text-red-600' : 'text-gray-800'}`}>{value}</dd>
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

export default async function JobDetailsPage({ params }) {
  const job = await getJobById(params.id);
  if (!job) notFound();

  const [settings, relatedJobs] = await Promise.all([getSiteSettings(), getRelatedJobs(job, 3)]);

  const showManual = job.job_type === 'Government' || job.application_mode === 'Manual/By Post';
  const isExpired = isDatePast(job.last_date);
  const remaining = daysRemaining(job.last_date);
  const canApply = job.show_apply_button !== false && !!job.apply_link;

  // JobPosting structured data — only real, admin-entered fields; never
  // fabricates an employment type, salary number or address that wasn't
  // actually provided, so this stays valid and accurate for Google Jobs.
  const jobSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description || buildMetaDescription(job),
    datePosted: job.created_at || undefined,
    ...(job.last_date ? { validThrough: job.last_date } : {}),
    hiringOrganization: {
      '@type': 'Organization',
      name: job.department || settings.site_name || 'Employer',
      ...(settings.logo_url ? { logo: settings.logo_url } : {}),
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        ...(job.city ? { addressLocality: job.city } : {}),
        addressCountry: 'PK',
      },
    },
    ...(job.vacancies && /^\d+$/.test(String(job.vacancies).trim())
      ? { totalJobOpenings: Number(job.vacancies) }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchema) }} />
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />

      <main className="flex-1 bg-gray-50 pb-24 md:pb-10">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-3xl px-4 pt-6 md:px-6">
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
            <Link href="/" className="hover:text-brand-700 hover:underline">
              Home
            </Link>
            <span>/</span>
            <Link href="/jobs" className="hover:text-brand-700 hover:underline">
              Jobs
            </Link>
            <span>/</span>
            <span className="truncate text-gray-400">{job.title}</span>
          </nav>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-5 md:px-6">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            {/* Header */}
            <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:px-6">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                    job.job_type === 'Government' ? 'bg-brand-50 text-brand-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {job.job_type}
                </span>
                {job.sector && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                    {job.sector}
                  </span>
                )}
                {job.source_type && job.verified_on && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    ✓ Verified {formatDate(job.verified_on)}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold leading-snug text-gray-900 sm:text-2xl">{job.title}</h1>
              <p className="text-sm text-gray-500">{job.department || 'Department not specified'}</p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <JobShareButton title={job.title} url={`${SITE_URL}/jobs/${job.id}`} />
              </div>
            </div>

            <div className="flex flex-col gap-6 px-5 py-5 sm:px-6">
              {/* Official Source strip */}
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

              {job.description && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Description</p>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-gray-800">{job.description}</p>
                </div>
              )}

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
                <Row label="Last Date to Apply" value={formatDate(job.last_date)} danger={isExpired} />
              </dl>

              {!isExpired && remaining !== null && remaining <= 3 && (
                <p className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm font-bold text-red-600">
                  {remaining === 0 ? 'Closing today — apply now.' : `Only ${remaining} day${remaining === 1 ? '' : 's'} left to apply.`}
                </p>
              )}

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
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Postal Address</p>
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

              {settings?.wa_service_enabled && <WhatsAppServiceCard settings={settings} compact />}
            </div>

            {/* Actions — same layout as the old modal footer, just inline
                on the page now instead of sticky-in-modal. Also duplicated
                as a sticky mobile bar below so Apply Now stays reachable
                on a long job description without scrolling back up. */}
            <div className="flex flex-col gap-2 border-t border-gray-100 bg-white px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:px-6">
              {canApply && (
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
              </div>
            </div>
          </div>

          {/* Similar Jobs */}
          {relatedJobs.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-base font-bold text-gray-900 md:text-lg">Similar Jobs</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedJobs.map((rj) => (
                  <PublicJobCard key={rj.id} job={rj} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sticky mobile Apply bar — mirrors the old modal's always-reachable
          Apply Now button, since this page can now be much longer than the
          modal ever was. */}
      {canApply && (
        <div className="fixed inset-x-0 bottom-16 z-20 border-t border-gray-100 bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur sm:hidden">
          <a
            href={job.apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-center text-sm font-bold text-white shadow-md shadow-brand-600/20 active:scale-[0.98]"
          >
            Apply Now
          </a>
        </div>
      )}

      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
