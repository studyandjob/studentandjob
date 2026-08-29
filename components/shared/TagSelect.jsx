'use client';

import { useState } from 'react';

/**
 * Multi-select "tag" picker: pick from a predefined dropdown list (so the
 * AI matching logic has a consistent vocabulary to compare against) and/or
 * add a free-text custom tag. Selected values render as removable chips.
 *
 * @param {string[]} options - predefined choices
 * @param {string[]} value - currently selected tags
 * @param {(tags: string[]) => void} onChange
 */
export default function TagSelect({ options = [], value = [], onChange, placeholder = 'Add a tag…' }) {
  const [customInput, setCustomInput] = useState('');

  function addTag(tag) {
    const clean = (tag || '').trim();
    if (!clean || value.includes(clean)) return;
    onChange([...value, clean]);
  }

  function removeTag(tag) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleCustomSubmit() {
    addTag(customInput);
    setCustomInput('');
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value=""
          onChange={(e) => addTag(e.target.value)}
          className="w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-3 text-[0.93rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10 sm:w-1/2"
        >
          <option value="">Choose from list…</option>
          {options
            .filter((o) => !value.includes(o))
            .map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
        </select>

        <div className="flex w-full gap-2 sm:w-1/2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              // Enter should add the tag, not submit the parent job form
              // that this component is always nested inside of.
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCustomSubmit();
              }
            }}
            placeholder={placeholder}
            className="w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-3 text-[0.93rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10"
          />
          <button
            type="button"
            onClick={handleCustomSubmit}
            className="flex-shrink-0 rounded-[10px] bg-atl px-4 py-2 text-sm font-semibold text-white transition hover:bg-atl2"
          >
            Add
          </button>
        </div>
      </div>

      {value.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 rounded-full bg-atl/10 px-3 py-1.5 text-xs font-semibold text-atl"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-atl/60 hover:text-acoral"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
