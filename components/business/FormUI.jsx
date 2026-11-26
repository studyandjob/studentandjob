'use client';

import { useState } from 'react';

export const inputCls =
  'w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-sm text-gray-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition placeholder:text-gray-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 disabled:cursor-not-allowed disabled:opacity-60';

export function Field({ label, required, hint, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-semibold text-gray-900">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

export function TextField({ label, value, onChange, required, hint, className, type = 'text', ...rest }) {
  return (
    <Field label={label} required={required} hint={hint} className={className}>
      <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputCls} {...rest} />
    </Field>
  );
}

export function TextAreaField({ label, value, onChange, required, hint, className, rows = 4, ...rest }) {
  return (
    <Field label={label} required={required} hint={hint} className={className}>
      <textarea rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputCls} {...rest} />
    </Field>
  );
}

// options: string[] or { value, label }[]
export function SelectField({ label, value, onChange, options = [], required, hint, className, placeholder = '— chunein —', disabled }) {
  return (
    <Field label={label} required={required} hint={hint} className={className}>
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={inputCls}>
        <option value="">{placeholder}</option>
        {options.map((o) => {
          const v = typeof o === 'string' ? o : o.value;
          const l = typeof o === 'string' ? o : o.label;
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
    </Field>
  );
}

/** Type a value, press Enter or comma to add it as a chip. */
export function TagInput({ label, values = [], onChange, suggestions = [], placeholder, hint, required, className }) {
  const [text, setText] = useState('');
  const listId = `tags-${label.replace(/\W+/g, '')}`;

  function add(raw) {
    const items = String(raw)
      .split(/[,\n]/)
      .map((x) => x.trim())
      .filter(Boolean)
      .filter((x) => !values.some((v) => v.toLowerCase() === x.toLowerCase()));
    if (items.length) onChange([...values, ...items]);
    setText('');
  }

  return (
    <Field label={label} required={required} hint={hint || 'Likh kar Enter ya comma dabayein'} className={className}>
      <div className="rounded-xl border border-line bg-surface p-2 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/20">
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span key={v} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              {v}
              <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`${v} hatayein`} className="text-brand-700/70 hover:text-brand-700">
                ×
              </button>
            </span>
          ))}
          <input
            list={suggestions.length ? listId : undefined}
            value={text}
            onChange={(e) => (e.target.value.endsWith(',') ? add(e.target.value) : setText(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add(text);
              } else if (e.key === 'Backspace' && !text && values.length) onChange(values.slice(0, -1));
            }}
            onBlur={() => text.trim() && add(text)}
            placeholder={values.length ? '' : placeholder}
            className="min-w-[140px] flex-1 bg-transparent px-2 py-1.5 text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>
      {suggestions.length > 0 && (
        <datalist id={listId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </Field>
  );
}

/** Pick several from a fixed list (languages etc.). */
export function ChipMulti({ label, options, values = [], onChange, hint, required, className }) {
  const toggle = (o) => onChange(values.includes(o) ? values.filter((v) => v !== o) : [...values, o]);
  return (
    <Field label={label} required={required} hint={hint} className={className}>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = values.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => toggle(o)}
              aria-pressed={on}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                on ? 'border-brand-600 bg-brand-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]' : 'border-line bg-surface text-gray-700 hover:bg-surface-alt'
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </Field>
  );
}

export function Toggle({ label, checked, onChange, hint }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface px-3.5 py-3">
      <span className="relative mt-0.5 inline-flex h-5 w-9 flex-shrink-0">
        <input type="checkbox" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="absolute inset-0 rounded-full bg-gray-300 transition peer-checked:bg-emerald-500" />
        <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-gray-900">{label}</span>
        {hint && <span className="block text-xs text-gray-500">{hint}</span>}
      </span>
    </label>
  );
}

export function Section({ title, subtitle, children }) {
  return (
    <section className="rounded-3xl border border-line bg-gradient-to-b from-surface to-surface-alt p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_26px_-18px_rgba(0,0,0,0.3)] md:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

export function Banner({ kind = 'error', children }) {
  const cls =
    kind === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : kind === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
        : 'border-amber-200 bg-amber-50 text-amber-800';
  return <p className={`rounded-xl border px-4 py-3 text-sm ${cls}`}>{children}</p>;
}
