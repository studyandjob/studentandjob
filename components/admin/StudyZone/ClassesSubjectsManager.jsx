'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PlusIcon, TrashIcon } from '../icons';

const inputClass =
  'w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-2.5 text-[0.9rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10';

export default function ClassesSubjectsManager({ classes, subjects, onClassesChange, onSubjectsChange }) {
  const [newClass, setNewClass] = useState('');
  const [savingClass, setSavingClass] = useState(false);
  const [subjectClassId, setSubjectClassId] = useState(classes[0]?.id || '');
  const [newSubject, setNewSubject] = useState('');
  const [savingSubject, setSavingSubject] = useState(false);
  const [error, setError] = useState('');

  async function addClass(e) {
    e.preventDefault();
    if (!newClass.trim()) return;
    setSavingClass(true);
    setError('');
    const { data, error } = await supabase
      .from('classes')
      .insert({ class_name: newClass.trim(), display_order: classes.length })
      .select();
    setSavingClass(false);
    if (error) return setError(error.message);
    onClassesChange([...classes, ...(data || [])]);
    setNewClass('');
  }

  async function deleteClass(id) {
    if (!confirm('Delete this class? Its subjects and question bank will be removed too.')) return;
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) return setError(error.message);
    onClassesChange(classes.filter((c) => c.id !== id));
    onSubjectsChange(subjects.filter((s) => s.class_id !== id));
  }

  async function addSubject(e) {
    e.preventDefault();
    if (!newSubject.trim() || !subjectClassId) return;
    setSavingSubject(true);
    setError('');
    const { data, error } = await supabase
      .from('subjects')
      .insert({ class_id: subjectClassId, subject_name: newSubject.trim() })
      .select();
    setSavingSubject(false);
    if (error) return setError(error.message);
    onSubjectsChange([...subjects, ...(data || [])]);
    setNewSubject('');
  }

  async function deleteSubject(id) {
    if (!confirm('Delete this subject? Its question bank will be removed too.')) return;
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) return setError(error.message);
    onSubjectsChange(subjects.filter((s) => s.id !== id));
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 md:col-span-2">{error}</p>
      )}

      {/* Classes */}
      <div className="rounded-xl border border-aline bg-white p-4">
        <h3 className="mb-3 text-sm font-bold text-aink">Classes</h3>
        <form onSubmit={addClass} className="mb-3 flex gap-2">
          <input
            className={inputClass}
            placeholder="e.g. 9th, 10th, 1st Year"
            value={newClass}
            onChange={(e) => setNewClass(e.target.value)}
          />
          <button
            type="submit"
            disabled={savingClass}
            className="flex flex-shrink-0 items-center gap-1 rounded-[10px] bg-atl px-3.5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </form>
        <ul className="flex flex-col gap-1.5">
          {classes.length === 0 && <li className="text-sm text-amuted">No classes yet.</li>}
          {classes.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-lg border border-aline px-3 py-2 text-sm">
              <span className="font-medium text-aink">{c.class_name}</span>
              <button onClick={() => deleteClass(c.id)} className="text-red-500 hover:text-red-700">
                <TrashIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Subjects */}
      <div className="rounded-xl border border-aline bg-white p-4">
        <h3 className="mb-3 text-sm font-bold text-aink">Subjects</h3>
        <form onSubmit={addSubject} className="mb-3 flex flex-col gap-2 sm:flex-row">
          <select className={inputClass} value={subjectClassId} onChange={(e) => setSubjectClassId(e.target.value)}>
            <option value="">Select class...</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.class_name}
              </option>
            ))}
          </select>
          <input
            className={inputClass}
            placeholder="e.g. English, Mathematics"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />
          <button
            type="submit"
            disabled={savingSubject || !subjectClassId}
            className="flex flex-shrink-0 items-center gap-1 rounded-[10px] bg-atl px-3.5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </form>
        <ul className="flex max-h-72 flex-col gap-1.5 overflow-y-auto">
          {subjects.length === 0 && <li className="text-sm text-amuted">No subjects yet.</li>}
          {subjects.map((s) => (
            <li key={s.id} className="flex items-center justify-between rounded-lg border border-aline px-3 py-2 text-sm">
              <span className="font-medium text-aink">
                {s.subject_name}
                <span className="ml-2 text-xs text-amuted">
                  ({classes.find((c) => c.id === s.class_id)?.class_name || '—'})
                </span>
              </span>
              <button onClick={() => deleteSubject(s.id)} className="text-red-500 hover:text-red-700">
                <TrashIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
