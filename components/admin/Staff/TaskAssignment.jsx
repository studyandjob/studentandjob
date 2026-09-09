'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CheckSquareIcon } from '../icons';

const MODULES = [
  { id: 'jobs', label: 'Jobs' },
  { id: 'studyzone', label: 'Study Zone (Notes, Papers, Classes)' },
  { id: 'results', label: 'Results' },
  { id: 'scholarships', label: 'Scholarships' },
];

export default function TaskAssignment({ staff, permissionsByUser, onChanged }) {
  const [selectedId, setSelectedId] = useState(staff[0]?.id || '');
  const [checked, setChecked] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!selectedId && staff.length > 0) setSelectedId(staff[0].id);
  }, [staff, selectedId]);

  useEffect(() => {
    setChecked(permissionsByUser[selectedId] || []);
    setSuccess('');
    setError('');
  }, [selectedId, permissionsByUser]);

  function toggle(moduleId) {
    setChecked((prev) => (prev.includes(moduleId) ? prev.filter((m) => m !== moduleId) : [...prev, moduleId]));
  }

  async function handleSave() {
    if (!selectedId) return;
    setSaving(true);
    setError('');
    setSuccess('');
    const before = permissionsByUser[selectedId] || [];
    const toAdd = checked.filter((m) => !before.includes(m));
    const toRemove = before.filter((m) => !checked.includes(m));

    if (toAdd.length > 0) {
      const { error: insertError } = await supabase
        .from('staff_permissions')
        .insert(toAdd.map((module) => ({ user_id: selectedId, module })));
      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }
    }
    if (toRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from('staff_permissions')
        .delete()
        .eq('user_id', selectedId)
        .in('module', toRemove);
      if (deleteError) {
        setError(deleteError.message);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    setSuccess('Tasks update ho gaye.');
    onChanged?.(selectedId, checked);
  }

  if (staff.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-amuted">
        Pehle "Add User" tab se ek staff account banayein, phir yahan unhe tasks assign karein.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {success && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>
      )}

      <label>
        <span className="mb-1.5 block text-[0.85rem] font-semibold text-aink">Staff Member</span>
        <select
          className="w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-2.5 text-[0.9rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10 sm:max-w-sm"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.email})
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-2.5">
        {MODULES.map((m) => (
          <label
            key={m.id}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-aline bg-white px-4 py-3 transition hover:border-atl2/40"
          >
            <input
              type="checkbox"
              checked={checked.includes(m.id)}
              onChange={() => toggle(m.id)}
              className="h-4 w-4 flex-shrink-0 accent-atl2"
            />
            <span className="text-sm font-medium text-aink">{m.label}</span>
          </label>
        ))}
      </div>

      <div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_rgba(30,132,73,0.5)] transition hover:-translate-y-0.5 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #1E8449, #2E5AAC)' }}
        >
          <CheckSquareIcon className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Tasks'}
        </button>
      </div>
    </div>
  );
}
