'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PlusIcon, TrashIcon } from '../icons';

const inputClass =
  'w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-2.5 text-[0.9rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10';
const labelClass = 'mb-1.5 block text-[0.85rem] font-semibold text-aink';

const emptyForm = { material_type: 'guess_paper', class_id: '', subject_id: '', title: '', year: '', file_url: '' };

export default function StudyMaterialsManager({ classes, subjects, initialRows = [] }) {
  const [rows, setRows] = useState(initialRows);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredSubjects = subjects.filter((s) => s.class_id === form.class_id);
  const visibleRows = filterType === 'all' ? rows : rows.filter((r) => r.material_type === filterType);

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value, ...(name === 'class_id' ? { subject_id: '' } : {}) }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.file_url.trim()) {
      setError('Title and File URL are required.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      material_type: form.material_type,
      class_id: form.class_id || null,
      subject_id: form.subject_id || null,
      title: form.title.trim(),
      year: form.year.trim() || null,
      file_url: form.file_url.trim(),
    };
    const { data, error } = await supabase.from('study_materials').insert(payload).select();
    setSaving(false);
    if (error) return setError(error.message);
    setRows((prev) => [...(data || []), ...prev]);
    setForm(emptyForm);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this item?')) return;
    const { error } = await supabase.from('study_materials').delete().eq('id', id);
    if (error) return setError(error.message);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function classNameFor(id) {
    return classes.find((c) => c.id === id)?.class_name || 'All classes';
  }
  function subjectNameFor(id) {
    return subjects.find((s) => s.id === id)?.subject_name || 'All subjects';
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

      <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3.5 rounded-xl bg-[#F5F9F8] p-4 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Type</span>
          <select className={inputClass} value={form.material_type} onChange={(e) => update('material_type', e.target.value)}>
            <option value="guess_paper">Guess Paper / Suggestion</option>
            <option value="old_paper">Previous / Old Paper</option>
          </select>
        </label>

        <label>
          <span className={labelClass}>Year (optional, for old papers)</span>
          <input className={inputClass} placeholder="e.g. 2025" value={form.year} onChange={(e) => update('year', e.target.value)} />
        </label>

        <label>
          <span className={labelClass}>Class (optional)</span>
          <select className={inputClass} value={form.class_id} onChange={(e) => update('class_id', e.target.value)}>
            <option value="">All classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.class_name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className={labelClass}>Subject (optional)</span>
          <select className={inputClass} value={form.subject_id} onChange={(e) => update('subject_id', e.target.value)} disabled={!form.class_id}>
            <option value="">All subjects</option>
            {filteredSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.subject_name}
              </option>
            ))}
          </select>
        </label>

        <label className="sm:col-span-2">
          <span className={labelClass}>Title</span>
          <input className={inputClass} placeholder="e.g. English Guess Paper 2026" value={form.title} onChange={(e) => update('title', e.target.value)} />
        </label>

        <label className="sm:col-span-2">
          <span className={labelClass}>File URL (PDF link)</span>
          <input className={inputClass} placeholder="https://..." value={form.file_url} onChange={(e) => update('file_url', e.target.value)} />
        </label>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_rgba(242,120,92,0.5)] transition hover:-translate-y-0.5 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #E8A33D, #F2785C)' }}
          >
            <PlusIcon className="h-4 w-4" />
            {saving ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>

      <div className="flex gap-2 text-xs">
        {['all', 'guess_paper', 'old_paper'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`rounded-full px-3 py-1.5 font-semibold ${
              filterType === t ? 'bg-atl text-white' : 'bg-[#F5F9F8] text-amuted'
            }`}
          >
            {t === 'all' ? 'All' : t === 'guess_paper' ? 'Guess Papers' : 'Old Papers'}
          </button>
        ))}
      </div>

      {visibleRows.length === 0 ? (
        <p className="py-6 text-center text-sm text-amuted">No entries yet.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {visibleRows.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-aline bg-white px-4 py-3">
              <div className="min-w-0 flex-1 text-sm text-aink">
                <p className="font-semibold">{row.title}</p>
                <p className="text-xs text-amuted">
                  {row.material_type === 'guess_paper' ? 'Guess Paper' : 'Old Paper'} · {classNameFor(row.class_id)} · {subjectNameFor(row.subject_id)}
                  {row.year && ` · ${row.year}`}
                </p>
              </div>
              <button
                onClick={() => handleDelete(row.id)}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-600 hover:text-white"
              >
                <TrashIcon className="h-3.5 w-3.5" />
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
