import { notFound, redirect } from 'next/navigation';
import Header from '@/components/Header';
import NewsTicker from '@/components/NewsTicker';
import Footer from '@/components/Footer';
import AdGate from '@/components/AdGate';
import { getSiteSettings, getJobById } from '@/lib/data';

export const dynamic = 'force-dynamic';

// This page only exists to show an ad before a job; it must never be indexed.
export const metadata = { title: 'Opening job', robots: { index: false, follow: false } };

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function JobAdGatePage({ params }) {
  const [settings, job] = await Promise.all([getSiteSettings(), getJobById(params.id)]);
  if (!job) notFound();

  const gateOn = Boolean(settings.ad_gate_enabled && settings.ad_gate_code?.trim());
  if (!gateOn) redirect(`/jobs/${job.id}`);

  return (
    <>
      <NewsTicker text={settings.scrolling_news} />
      <Header siteName={settings.site_name} logoUrl={settings.logo_url} />
      <main className="flex-1 bg-gray-50">
        <AdGate
          jobId={job.id}
          title={job.title}
          department={job.department}
          lastDate={formatDate(job.last_date)}
          seconds={settings.ad_gate_seconds ?? 5}
          html={settings.ad_gate_code}
        />
      </main>
      <Footer siteName={settings.site_name} settings={settings} />
    </>
  );
}
