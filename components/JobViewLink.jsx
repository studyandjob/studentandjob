'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSiteConfig } from './SiteConfigProvider';

const COUNT_KEY = 'oj_gate_count';
const UNLOCKED_KEY = 'oj_gate_unlocked';

/**
 * "View Details" link for a job. The href is always the real job URL (so
 * Google and "open in new tab" work normally). On a plain click, when the
 * ad gate is on, the visitor is first sent to /jobs/[id]/ad, which shows an
 * ad and then continues to the job. A job already unlocked this session, or
 * a visitor past the per-session limit, goes straight through.
 */
export default function JobViewLink({ jobId, children, ...props }) {
  const router = useRouter();
  const { adGate } = useSiteConfig();

  function handleClick(e) {
    if (!adGate?.enabled) return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    try {
      const unlocked = JSON.parse(sessionStorage.getItem(UNLOCKED_KEY) || '[]');
      if (unlocked.includes(String(jobId))) return;
      const shown = Number(sessionStorage.getItem(COUNT_KEY) || 0);
      if (adGate.maxPerSession > 0 && shown >= adGate.maxPerSession) return;
      sessionStorage.setItem(COUNT_KEY, String(shown + 1));
    } catch {
      // Storage blocked (private mode): still show the gate.
    }
    e.preventDefault();
    router.push(`/jobs/${jobId}/ad`);
  }

  return (
    <Link href={`/jobs/${jobId}`} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
