'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchIcon3D, BriefcaseIcon3D, GraduationCapIcon3D, NotesBookIcon3D, VerifiedBadgeIcon3D } from './Icons3D';
import { supabase } from '@/lib/supabaseClient';
import { isJobOpen } from '@/lib/jobStatus';

// Quick category links shown under the search box so it's obvious what
// this search actually covers — every href is a real, existing route.
const CATEGORY_LINKS = [
  { label: 'Jobs', href: '/jobs', Icon: BriefcaseIcon3D },
  { label: 'Scholarships', href: '/scholarships', Icon: VerifiedBadgeIcon3D },
  { label: 'Notes', href: '/study-zone/notes', Icon: NotesBookIcon3D },
  { label: 'Past Papers', href: '/study-zone/materials?type=old_paper', Icon: GraduationCapIcon3D },
  { label: 'Results', href: '/results', Icon: NotesBookIcon3D },
];

const SUGGESTION_DEBOUNCE_MS = 300;
const MAX_PER_TYPE = 3;

export default function SearchBar({ showCategoryLinks = true }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  // Live suggestions pulled straight from the real tables (title match
  // only, small LIMIT per type) — never invented copy, just a fast
  // preview of what a full search would return.
  useEffect(() => {
    const q = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const [{ data: jobs }, { data: notes }, { data: scholarships }] = await Promise.all([
          supabase
            .from('jobs_table')
            .select('id, title, status, last_date')
            .ilike('title', `%${q}%`)
            .order('created_at', { ascending: false })
            .limit(MAX_PER_TYPE + 2), // small buffer since expired ones get filtered client-side
          supabase.from('students_data').select('id, title').ilike('title', `%${q}%`).limit(MAX_PER_TYPE),
          supabase.from('scholarships_table').select('id, title').ilike('title', `%${q}%`).limit(MAX_PER_TYPE),
        ]);

        const openJobs = (jobs || []).filter(isJobOpen).slice(0, MAX_PER_TYPE);

        const combined = [
          ...openJobs.map((j) => ({ type: 'Job', label: j.title })),
          ...(notes || []).map((n) => ({ type: 'Note', label: n.title })),
          ...(scholarships || []).map((s) => ({ type: 'Scholarship', label: s.title })),
        ].filter((s) => s.label);

        setSuggestions(combined);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, SUGGESTION_DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Close the suggestions dropdown on outside click.
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function goToSearch(term) {
    const value = term.trim();
    if (!value) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(value)}`);
  }

  function handleSubmit(e) {
    e.preventDefault();
    goToSearch(query);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={handleSubmit}
        role="search"
        className="flex w-full items-center gap-2 rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-brand-400"
      >
        <SearchIcon3D className="ml-1 h-6 w-6 flex-shrink-0" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          placeholder="Search jobs, scholarships, notes, past papers, results..."
          aria-label="Search jobs, scholarships, notes, past papers and results"
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-autocomplete="list"
          autoComplete="off"
          className="flex-1 min-w-0 border-none bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 md:text-base"
        />
        <button
          type="submit"
          className="flex-shrink-0 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 md:px-5"
        >
          Search
        </button>
      </form>

      {/* Live suggestions dropdown */}
      {open && query.trim().length >= 2 && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5"
        >
          {loading ? (
            <p className="px-3 py-2 text-xs text-gray-400">Searching…</p>
          ) : suggestions.length > 0 ? (
            suggestions.map((s, i) => (
              <button
                key={`${s.type}-${i}`}
                type="button"
                role="option"
                aria-selected="false"
                onClick={() => goToSearch(s.label)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-brand-50 hover:text-brand-700"
              >
                <span className="flex-shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  {s.type}
                </span>
                <span className="truncate">{s.label}</span>
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-xs text-gray-400">No quick matches — press Search to see full results.</p>
          )}
        </div>
      )}

      {showCategoryLinks && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 lg:justify-start">
          <span className="text-xs font-medium text-gray-400">You can search:</span>
          {CATEGORY_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-xs font-semibold text-gray-600 underline-offset-4 transition hover:text-brand-700 hover:underline"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
