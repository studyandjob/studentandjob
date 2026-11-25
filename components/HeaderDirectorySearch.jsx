'use client';

import HomeIcon from './HomeIcons';

// Directory versions of the header's search forms. They send visitors to
// /directory?q=...&city=...&near=1 — the directory page reads those and runs
// the search (near=1 => it asks for the visitor's location).

export function DesktopDirectorySearch() {
  return (
    <form
      action="/directory"
      method="get"
      role="search"
      className="mx-auto mb-5 flex w-full max-w-4xl items-stretch rounded-full border border-line-strong bg-gradient-to-b from-surface to-surface-alt shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_28px_-12px_rgba(0,0,0,0.35)]"
    >
      <label className="flex min-w-0 flex-[1.6] cursor-text flex-col justify-center rounded-full px-8 py-3 transition hover:bg-surface-alt focus-within:bg-surface focus-within:shadow-pill">
        <span className="text-xs font-bold text-gray-900">Kya</span>
        <input name="q" type="search" placeholder="Doctor, school, hotel ya naam..." className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500" />
      </label>
      <span className="my-4 w-px bg-line" />
      <label className="flex min-w-0 flex-1 cursor-text flex-col justify-center rounded-full px-7 py-3 transition hover:bg-surface-alt focus-within:bg-surface focus-within:shadow-pill">
        <span className="text-xs font-bold text-gray-900">Shehar</span>
        <input name="city" type="text" placeholder="e.g. Bahawalpur" className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500" />
      </label>
      <span className="my-4 w-px bg-line" />
      <label className="flex min-w-0 flex-1 cursor-pointer flex-col justify-center rounded-full py-3 pl-7 pr-2 transition hover:bg-surface-alt focus-within:bg-surface focus-within:shadow-pill">
        <span className="text-xs font-bold text-gray-900">Qareeb</span>
        <select name="near" defaultValue="" className="w-full min-w-0 cursor-pointer appearance-none bg-transparent text-sm text-gray-700 outline-none">
          <option value="">Kahin bhi</option>
          <option value="1">Mere qareeb</option>
        </select>
      </label>
      <button
        type="submit"
        className="m-2 flex h-14 items-center gap-2 rounded-full bg-gradient-to-b from-brand-500 to-brand-700 px-6 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_8px_18px_-8px_rgba(0,0,0,0.5)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        <HomeIcon name="search" className="h-5 w-5" />
        Search
      </button>
    </form>
  );
}

export function MobileDirectorySearch() {
  return (
    <form action="/directory" method="get" className="flex flex-1 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-4">
        <label className="block rounded-3xl bg-surface p-5 shadow-pill">
          <span className="text-lg font-semibold text-gray-900">Kya dhoondna hai?</span>
          <span className="mt-3 flex items-center gap-3 rounded-xl border border-line-strong px-4 py-3.5">
            <HomeIcon name="search" className="h-5 w-5 text-gray-700" />
            <input name="q" type="search" autoFocus placeholder="Doctor, school, hotel ya naam" className="w-full bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-500" />
          </span>
        </label>

        <label className="block rounded-3xl bg-surface p-5 shadow-card">
          <span className="text-lg font-semibold text-gray-900">Shehar</span>
          <input name="city" type="text" placeholder="e.g. Bahawalpur" className="mt-3 w-full rounded-xl border border-line-strong bg-surface px-4 py-3.5 text-base text-gray-900 outline-none focus:border-brand-600" />
        </label>

        <fieldset className="rounded-3xl bg-surface p-5 shadow-card">
          <legend className="sr-only">Qareeb</legend>
          <p className="text-lg font-semibold text-gray-900">Kahan?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              ['', 'Kahin bhi'],
              ['1', 'Mere qareeb'],
            ].map(([value, label]) => (
              <label key={value || 'any'} className="cursor-pointer">
                <input type="radio" name="near" value={value} defaultChecked={value === ''} className="peer sr-only" />
                <span className="inline-block rounded-full border border-line-strong px-4 py-2 text-sm font-semibold text-gray-700 transition peer-checked:border-gray-900 peer-checked:bg-surface-alt peer-checked:text-gray-900 peer-checked:ring-1 peer-checked:ring-gray-900">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="flex items-center justify-between border-t border-line bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button type="reset" className="text-sm font-semibold text-gray-900 underline underline-offset-4">
          Clear all
        </button>
        <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 px-7 py-3.5 text-base font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition active:scale-[0.98]">
          <HomeIcon name="search" className="h-5 w-5" />
          Search
        </button>
      </div>
    </form>
  );
}
