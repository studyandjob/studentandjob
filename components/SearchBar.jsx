'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon3D } from './Icons3D';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-2 rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5"
    >
      <SearchIcon3D className="ml-1 h-6 w-6 flex-shrink-0" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search jobs, notes, guess papers..."
        className="flex-1 border-none bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 md:text-base"
      />
      <button
        type="submit"
        className="flex-shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 md:px-5"
      >
        Search
      </button>
    </form>
  );
}
