'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HomeIcon from './HomeIcons';

/** Home-page job search: sends the visitor to /jobs with the text already
 * applied as the search filter. Airbnb-style floating pill. */
export default function JobSearchForm() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/jobs?q=${encodeURIComponent(q)}` : '/jobs');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-2xl items-center gap-2 rounded-full border border-line bg-surface p-2 pl-5 shadow-pill transition focus-within:shadow-card-hover"
      role="search"
    >
      <HomeIcon name="search" className="h-5 w-5 flex-shrink-0 text-gray-400" />
      <label className="flex-1">
        <span className="sr-only">Search jobs</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Job title, department or city"
          className="w-full bg-transparent py-2 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-500 md:text-base"
        />
      </label>
      <button
        type="submit"
        className="rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700 active:scale-[0.97] md:px-7"
      >
        Search
      </button>
    </form>
  );
}
