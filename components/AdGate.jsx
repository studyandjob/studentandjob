'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdCode from './AdCode';

const UNLOCKED_KEY = 'oj_gate_unlocked';

export default function AdGate({ jobId, title, department, lastDate, seconds = 5, html }) {
  const router = useRouter();
  const [left, setLeft] = useState(Math.max(0, Number(seconds) || 0));

  useEffect(() => {
    if (left <= 0) return undefined;
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  function handleContinue() {
    try {
      const unlocked = JSON.parse(sessionStorage.getItem(UNLOCKED_KEY) || '[]');
      sessionStorage.setItem(UNLOCKED_KEY, JSON.stringify([...unlocked, String(jobId)]));
    } catch {
      // ignore
    }
    // replace, so the Back button returns to the job list, not to this page
    router.replace(`/jobs/${jobId}`);
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8">
      <div className="rounded-2xl bg-surface p-5 border border-line shadow-card sm:p-6">
        <p className="text-xs font-semibold text-brand-700">Your job is ready</p>
        <h1 className="mt-1 text-lg font-bold leading-snug text-gray-900 sm:text-xl">{title}</h1>
        {department && <p className="mt-0.5 text-sm text-gray-500">{department}</p>}
        {lastDate && <p className="mt-2 text-sm font-semibold text-red-600">Last date: {lastDate}</p>}

        <div className="mt-5 border-t border-line pt-4">
          <p className="mb-1 text-center text-[11px] text-gray-400">Advertisement</p>
          <AdCode html={html} className="flex min-h-[250px] justify-center overflow-hidden" />
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={left > 0}
          className="mt-5 w-full rounded-xl bg-brand-600 px-4 py-3.5 text-sm font-bold text-white  transition enabled:hover:bg-brand-700 enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
        >
          {left > 0 ? `Continue to job in ${left}…` : 'Continue to job'}
        </button>
      </div>
    </div>
  );
}
