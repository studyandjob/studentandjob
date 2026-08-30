'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { TrashIcon, PlusIcon, SaveIcon } from '../icons';

const inputClass =
  'w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-2.5 text-[0.9rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10';
const labelClass = 'mb-1.5 block text-[0.85rem] font-semibold text-aink';

// Question types the admin can pick when browsing/filtering and when
// manually adding a question. Keys match the `question_type` check
// constraint on the question_bank table (sql/schema_v3_study_zone.sql).
const QUESTION_TYPES = [
  { key: 'mcq', label: 'MCQ Only' },
  { key: 'fill_in_blank', label: 'Fill in the Blank Only' },
  { key: 'short_answer', label: 'Short Answer' },
  { key: 'long_answer', label: 'Long Answer' },
];

function emptyDraft(type) {
  return {
    chapter_name: '',
    question_type: type,
    question_text: '',
    options: type === 'mcq' ? ['', '', '', ''] : [],
    correct_answer: '',
    marks: 1,
  };
}

export default function QuestionBankBrowser({ classes, subjects }) {
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [draft, setDraft] = useState(emptyDraft('mcq'));
  const [saving, setSaving] = useState(false);

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

  // Reset any in-progress manual-add form whenever the selected
  // class/subject/type combination changes, so a half-filled question for
  // one subject never gets accidentally saved under another.
  useEffect(() => {
    setShowAddForm(false);
    setDraft(emptyDraft(questionType || 'mcq'));
    setNotice('');
  }, [classId, subjectId, questionType]);

  async function handleDelete(id) {
    if (!confirm('Delete this question from the bank?')) return;
    const { error } = await supabase.from('question_bank').delete().eq('id', id);
    if (error) return setError(error.message);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function updateDraft(field, value) {
    setDraft((d) => ({ ...d, [field]: value }));
  }

  function updateDraftOption(index, value) {
    setDraft((d) => {
      const options = [...d.options];
      options[index] = value;
      return { ...d, options };
    });
  }

  async function handleSaveManual(e) {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!draft.question_text.trim()) {
      setError('Please write the question text.');
      return;
    }
    if (draft.question_type === 'mcq' && draft.options.filter((o) => o.trim()).length < 2) {
      setError('Please fill in at least 2 options for an MCQ.');
      return;
    }

    setSaving(true);
    const row = {
      class_id: classId,
      subject_id: subjectId,
      chapter_name: draft.chapter_name.trim() || null,
      question_type: draft.question_type,
      question_text: draft.question_text.trim(),
      options: draft.question_type === 'mcq' ? draft.options.filter((o) => o.trim()) : [],
      correct_answer: draft.correct_answer.trim() || null,
      marks: Number(draft.marks) || 1,
      source: 'manual',
    };

    const { data, error } = await supabase.from('question_bank').insert(row).select();
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setRows((prev) => [data[0], ...prev]);
    setDraft(emptyDraft(questionType));
    setNotice('Question added to the bank. You can add another below.');
  }

  const visibleRows = questionType ? rows.filter((r) => r.question_type === questionType) : rows;
  const countsByType = rows.reduce((acc, r) => {
    acc[r.question_type] = (acc[r.question_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
        <select
          className={inputClass}
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value)}
          disabled={!classId || !subjectId}
        >
          <option value="">All Question Types</option>
          {QUESTION_TYPES.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {notice && <p className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-700">{notice}</p>}

      {classId && subjectId && questionType && (
        <div>
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Add {QUESTION_TYPES.find((t) => t.key === questionType)?.label} Question Manually
            </button>
          ) : (
            <form onSubmit={handleSaveManual} className="rounded-xl border border-aline bg-[#F5F9F8] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-aink">
                  New {QUESTION_TYPES.find((t) => t.key === questionType)?.label} Question
                </p>
                <button type="button" onClick={() => setShowAddForm(false)} className="text-xs font-semibold text-amuted hover:text-aink">
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className={labelClass}>Chapter Name (optional)</span>
                  <input
                    className={inputClass}
                    placeholder="e.g. Chapter 3: The Merchant of Venice"
                    value={draft.chapter_name}
                    onChange={(e) => updateDraft('chapter_name', e.target.value)}
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className={labelClass}>Question Text</span>
                  <textarea
                    className={inputClass}
                    rows={3}
                    placeholder="Type the question here..."
                    value={draft.question_text}
                    onChange={(e) => updateDraft('question_text', e.target.value)}
                  />
                </label>

                {draft.question_type === 'mcq' && (
                  <div className="sm:col-span-2">
                    <span className={labelClass}>Options</span>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {draft.options.map((opt, i) => (
                        <input
                          key={i}
                          className={inputClass}
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={(e) => updateDraftOption(i, e.target.value)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <label className="sm:col-span-2">
                  <span className={labelClass}>
                    {draft.question_type === 'mcq'
                      ? 'Correct Answer (must match one of the options above)'
                      : draft.question_type === 'long_answer'
                      ? 'Model Answer (for admin reference)'
                      : 'Correct Answer'}
                  </span>
                  <textarea
                    className={inputClass}
                    rows={draft.question_type === 'long_answer' || draft.question_type === 'short_answer' ? 3 : 1}
                    value={draft.correct_answer}
                    onChange={(e) => updateDraft('correct_answer', e.target.value)}
                  />
                </label>

                <label>
                  <span className={labelClass}>Marks</span>
                  <input
                    type="number"
                    min="1"
                    className={inputClass}
                    value={draft.marks}
                    onChange={(e) => updateDraft('marks', e.target.value)}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-4 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_rgba(30,132,73,0.5)] transition hover:-translate-y-0.5 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #1E8449, #2E5AAC)' }}
              >
                <SaveIcon className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Question'}
              </button>
            </form>
          )}
        </div>
      )}

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
          ) : visibleRows.length === 0 ? (
            <p className="py-6 text-center text-sm text-amuted">
              {questionType ? 'No questions of this type saved yet.' : 'No questions saved yet for this class/subject.'}
            </p>
          ) : (
            <ul className="flex max-h-[32rem] flex-col gap-2 overflow-y-auto">
              {visibleRows.map((r) => (
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
                  <button onClick={() => handleDelete(r.id)} className="flex-shrink-0 text-red-500 hover:text-red-700">
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
