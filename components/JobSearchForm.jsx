'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon3D } from './Icons3D';

/** Home-page job search: sends the visitor to /jobs with the text already
 * applied as the search filter. */
export default function JobSearchForm() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/jobs?q=${encodeURIComponent(q)}` : '/jobs');
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-xl items-center gap-2" role="search">
      <label className="relative flex-1">
        <span className="sr-only">Search jobs</span>
        <SearchIcon3D className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Job title, department or city"
          className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
      </label>
      <button
        type="submit"
        className="rounded-xl bg-brand-600 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-700 active:scale-[0.98]"
      >
        Search
      </button>
    </form>
  );
}
