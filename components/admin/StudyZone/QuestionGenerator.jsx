'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { SparklesIcon, TrashIcon, SaveIcon } from '../icons';

const inputClass =
  'w-full rounded-[10px] border border-aline bg-[#FCFAF6] px-3.5 py-2.5 text-[0.9rem] text-aink outline-none transition focus:border-atl2 focus:ring-[3px] focus:ring-atl2/10';
const labelClass = 'mb-1.5 block text-[0.85rem] font-semibold text-aink';

const TYPE_OPTIONS = [
  { key: 'mcq', label: 'MCQs (4 options)', defaultCount: 20 },
  { key: 'fill_in_blank', label: 'Fill in the Blanks', defaultCount: 10 },
  { key: 'short_answer', label: 'Short Answers', defaultCount: 10 },
  { key: 'long_answer', label: 'Long Answers', defaultCount: 5 },
  { key: 'translation', label: 'Translation Paragraphs', defaultCount: 5 },
];

export default function QuestionGenerator({ classes, subjects }) {
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [chapterText, setChapterText] = useState('');
  const [counts, setCounts] = useState(
    Object.fromEntries(TYPE_OPTIONS.map((t) => [t.key, t.defaultCount]))
  );
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [draftQuestions, setDraftQuestions] = useState([]);

  const filteredSubjects = subjects.filter((s) => s.class_id === classId);
  const totalRequested = Object.values(counts).reduce((a, b) => a + (Number(b) || 0), 0);

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.txt')) {
      setError('For now, upload a plain .txt export of the chapter, or just paste the text below — PDF text extraction is not wired up yet.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setChapterText(String(reader.result || ''));
    reader.readAsText(file);
  }

  async function handleGenerate(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!classId || !subjectId || !chapterName.trim() || !chapterText.trim()) {
      setError('Please select a class, subject, and provide a chapter name and chapter text.');
      return;
    }
    if (totalRequested < 1) {
      setError('Set at least one question type count above zero.');
      return;
    }

    setGenerating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const className = classes.find((c) => c.id === classId)?.class_name || '';
      const subjectName = subjects.find((s) => s.id === subjectId)?.subject_name || '';

      const res = await fetch('/api/study-zone/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ className, subjectName, chapterName: chapterName.trim(), chapterText, counts }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Generation failed.');

      setDraftQuestions(payload.questions.map((q, i) => ({ ...q, _key: `${Date.now()}-${i}` })));
      setNotice(`Generated ${payload.received} question(s). Review below, then save to the question bank.`);
    } catch (err) {
      setError(err.message || 'Something went wrong while generating questions.');
    } finally {
      setGenerating(false);
    }
  }

  function updateDraft(key, field, value) {
    setDraftQuestions((prev) => prev.map((q) => (q._key === key ? { ...q, [field]: value } : q)));
  }

  function removeDraft(key) {
    setDraftQuestions((prev) => prev.filter((q) => q._key !== key));
  }

  async function handleSaveAll() {
    if (draftQuestions.length === 0) return;
    setSaving(true);
    setError('');
    const rows = draftQuestions.map(({ _key, ...q }) => ({
      class_id: classId,
      subject_id: subjectId,
      chapter_name: chapterName.trim(),
      question_type: q.question_type,
      question_text: q.question_text,
      options: q.question_type === 'mcq' ? q.options : [],
      correct_answer: q.correct_answer,
      marks: q.marks,
      source: 'ai',
    }));

    const { error } = await supabase.from('question_bank').insert(rows);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setNotice(`Saved ${rows.length} question(s) to the question bank for ${chapterName}.`);
    setDraftQuestions([]);
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleGenerate} className="rounded-xl border border-aline bg-[#F5F9F8] p-4">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <label>
            <span className={labelClass}>Class</span>
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
          </label>

          <label>
            <span className={labelClass}>Subject</span>
            <select className={inputClass} value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={!classId}>
              <option value="">Select subject...</option>
              {filteredSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subject_name}
                </option>
              ))}
            </select>
          </label>

          <label className="sm:col-span-2">
            <span className={labelClass}>Chapter Name</span>
            <input
              className={inputClass}
              placeholder="e.g. Chapter 3: The Merchant of Venice"
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
            />
          </label>

          <label className="sm:col-span-2">
            <span className={labelClass}>Chapter Content (paste text, or upload a .txt file)</span>
            <textarea
              className={inputClass}
              rows={8}
              placeholder="Paste the full chapter text here..."
              value={chapterText}
              onChange={(e) => setChapterText(e.target.value)}
            />
            <input type="file" accept=".txt" onChange={handleFileUpload} className="mt-2 text-xs text-amuted" />
          </label>
        </div>

        <div className="mt-4 rounded-lg border border-aline bg-white p-3.5">
          <p className={labelClass}>How many of each question type?</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {TYPE_OPTIONS.map((t) => (
              <label key={t.key} className="block">
                <span className="mb-1 block text-xs text-amuted">{t.label}</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className={inputClass}
                  value={counts[t.key]}
                  onChange={(e) => setCounts((c) => ({ ...c, [t.key]: e.target.value }))}
                />
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-amuted">Total requested: {totalRequested} questions</p>
        </div>

        {error && <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
        {notice && <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>}

        <button
          type="submit"
          disabled={generating}
          className="mt-4 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_rgba(242,120,92,0.5)] transition hover:-translate-y-0.5 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #E8A33D, #F2785C)' }}
        >
          <SparklesIcon className="h-4 w-4" />
          {generating ? 'Generating with AI...' : 'Generate Questions with AI'}
        </button>
      </form>

      {draftQuestions.length > 0 && (
        <div className="rounded-xl border border-aline bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-aink">Review before saving ({draftQuestions.length})</h3>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              <SaveIcon className="h-3.5 w-3.5" />
              {saving ? 'Saving...' : `Save ${draftQuestions.length} to Question Bank`}
            </button>
          </div>

          <ul className="flex flex-col gap-3">
            {draftQuestions.map((q) => (
              <li key={q._key} className="rounded-lg border border-aline p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="inline-block rounded bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-brand-600">
                    {q.question_type.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      className="w-16 rounded border border-aline px-2 py-1 text-xs"
                      value={q.marks}
                      onChange={(e) => updateDraft(q._key, 'marks', Number(e.target.value) || 1)}
                      title="Marks"
                    />
                    <button onClick={() => removeDraft(q._key)} className="text-rose-500 hover:text-rose-700">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <textarea
                  className={`${inputClass} mb-2`}
                  rows={2}
                  value={q.question_text}
                  onChange={(e) => updateDraft(q._key, 'question_text', e.target.value)}
                />

                {q.question_type === 'mcq' && (
                  <div className="mb-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {(q.options || []).map((opt, i) => (
                      <input
                        key={i}
                        className={inputClass}
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...q.options];
                          newOptions[i] = e.target.value;
                          updateDraft(q._key, 'options', newOptions);
                        }}
                      />
                    ))}
                  </div>
                )}

                <label className="block">
                  <span className="mb-1 block text-xs text-amuted">
                    {q.question_type === 'long_answer' ? 'Model answer (for admin reference)' : 'Correct answer'}
                  </span>
                  <input
                    className={inputClass}
                    value={q.correct_answer || ''}
                    onChange={(e) => updateDraft(q._key, 'correct_answer', e.target.value)}
                  />
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
