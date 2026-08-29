'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-400 focus:ring-[3px] focus:ring-brand-100';
const labelClass = 'mb-1.5 block text-sm font-semibold text-gray-700';

const TYPE_OPTIONS = [
  { key: 'mcq', label: 'MCQs only' },
  { key: 'fill_in_blank', label: 'Fill in the Blanks only' },
  { key: 'mixed', label: 'Mixed (all types)' },
];

const QUESTION_COUNT_OPTIONS = [10, 20, 30, 50];
const DURATION_OPTIONS = [15, 30, 45, 60];

export default function TestSetupForm({ classes }) {
  const router = useRouter();
  const [classId, setClassId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [typeChoice, setTypeChoice] = useState('mixed');
  const [questionCount, setQuestionCount] = useState(20);
  const [duration, setDuration] = useState(30);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!classId) {
      setSubjects([]);
      setSubjectId('');
      return;
    }
    setLoadingSubjects(true);
    supabase
      .from('subjects')
      .select('*')
      .eq('class_id', classId)
      .order('subject_name', { ascending: true })
      .then(({ data }) => {
        setSubjects(data || []);
        setLoadingSubjects(false);
      });
  }, [classId]);

  async function handleStart(e) {
    e.preventDefault();
    if (!classId || !subjectId) {
      setError('Please select a class and subject.');
      return;
    }
    setStarting(true);
    setError('');

    const questionTypes = typeChoice === 'mixed' ? null : [typeChoice];

    const { data, error } = await supabase.rpc('start_test_session', {
      p_class_id: classId,
      p_subject_id: subjectId,
      p_question_count: Number(questionCount),
      p_duration_minutes: Number(duration),
      p_student_name: studentName.trim() || null,
      p_question_types: questionTypes,
    });

    setStarting(false);
    if (error) {
      setError(error.message.includes('No questions available') ? 'No questions are available yet for this class/subject. Please try another selection.' : error.message);
      return;
    }
    if (!data || data.length === 0) {
      setError('No questions available yet for this class/subject.');
      return;
    }
    const sessionId = data[0].session_id;
    router.push(`/study-zone/test/${sessionId}`);
  }

  return (
    <form onSubmit={handleStart} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Your Name (optional)</span>
          <input className={inputClass} value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="e.g. Ahmed Khan" />
        </label>

        <div />

        <label>
          <span className={labelClass}>Class</span>
          <select className={inputClass} value={classId} onChange={(e) => setClassId(e.target.value)}>
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
          <select className={inputClass} value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={!classId || loadingSubjects}>
            <option value="">{loadingSubjects ? 'Loading...' : 'Select subject...'}</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.subject_name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className={labelClass}>Question Type</span>
          <select className={inputClass} value={typeChoice} onChange={(e) => setTypeChoice(e.target.value)}>
            {TYPE_OPTIONS.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className={labelClass}>Number of Questions</span>
          <select className={inputClass} value={questionCount} onChange={(e) => setQuestionCount(e.target.value)}>
            {QUESTION_COUNT_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} Questions
              </option>
            ))}
          </select>
        </label>

        <label className="sm:col-span-2">
          <span className={labelClass}>Duration</span>
          <select className={inputClass} value={duration} onChange={(e) => setDuration(e.target.value)}>
            {DURATION_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} Minutes
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        disabled={starting}
        className="mt-6 w-full rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
      >
        {starting ? 'Preparing your paper...' : 'Start Test →'}
      </button>
    </form>
  );
}
