'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { TrashIcon } from '../icons';

const inputClass =
  'w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-2.5 text-[0.9rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10';

export default function QuestionBankBrowser({ classes, subjects }) {
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredSubjects = subjects.filter((s) => s.class_id === classId);

  useEffect(() => {
    if (!classId || !subjectId) {
      setRows([]);
      return;
    }
    (async () => {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('question_bank')
        .select('*')
        .eq('class_id', classId)
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: false });
      setLoading(false);
      if (error) return setError(error.message);
      setRows(data || []);
    })();
  }, [classId, subjectId]);

  async function handleDelete(id) {
    if (!confirm('Delete this question from the bank?')) return;
    const { error } = await supabase.from('question_bank').delete().eq('id', id);
    if (error) return setError(error.message);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const countsByType = rows.reduce((acc, r) => {
    acc[r.question_type] = (acc[r.question_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select
          className={inputClass}
          value={classId}
          onChange={(e) => {
            setClassId(e.target.value);
            setSubjectId('');
          }}
        >
          <option value="">Select class...</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.class_name}
            </option>
          ))}
        </select>
        <select className={inputClass} value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={!classId}>
          <option value="">Select subject...</option>
          {filteredSubjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.subject_name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

      {classId && subjectId && (
        <>
          <p className="text-xs text-amuted">
            {rows.length} question(s) total —{' '}
            {Object.entries(countsByType)
              .map(([t, n]) => `${n} ${t.replace('_', ' ')}`)
              .join(', ') || 'none yet'}
          </p>

          {loading ? (
            <p className="py-6 text-center text-sm text-amuted">Loading...</p>
          ) : rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-amuted">No questions saved yet for this class/subject.</p>
          ) : (
            <ul className="flex max-h-[32rem] flex-col gap-2 overflow-y-auto">
              {rows.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-3 rounded-lg border border-aline px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span className="inline-block rounded bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-brand-600">
                        {r.question_type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-amuted">{r.chapter_name}</span>
                      <span className="text-[10px] text-amuted">· {r.marks} marks</span>
                      <span className="text-[10px] text-amuted">· {r.source}</span>
                    </div>
                    <p className="line-clamp-2 text-sm text-aink">{r.question_text}</p>
                  </div>
                  <button onClick={() => handleDelete(r.id)} className="flex-shrink-0 text-rose-500 hover:text-rose-700">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
