'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function ExamRunner({ sessionId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [meta, setMeta] = useState(null); // { status, started_at, duration_minutes, student_name }
  const [answers, setAnswers] = useState({}); // { [question_id]: string }
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const submittedRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.rpc('get_test_session', { p_session_id: sessionId });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (!data || data.length === 0) {
      setError('This test session was not found.');
      setLoading(false);
      return;
    }

    const first = data[0];
    setMeta({ status: first.status, started_at: first.started_at, duration_minutes: first.duration_minutes, student_name: first.student_name });
    setQuestions(
      data.map((q) => ({
        id: q.question_id,
        type: q.question_type,
        text: q.question_text,
        options: q.options || [],
        marks: q.marks,
        chapter: q.chapter_name,
      }))
    );

    if (first.status === 'completed') {
      const { data: sessionRow } = await supabase
        .from('student_test_sessions')
        .select('result, total_marks, score')
        .eq('id', sessionId)
        .maybeSingle();
      setResult(sessionRow?.result || null);
    } else {
      const startedAt = new Date(first.started_at).getTime();
      const endsAt = startedAt + first.duration_minutes * 60 * 1000;
      setSecondsLeft(Math.round((endsAt - Date.now()) / 1000));
    }

    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);

    const payload = Object.entries(answers).map(([question_id, answer]) => ({ question_id, answer }));
    const { data, error } = await supabase.rpc('submit_test_session', { p_session_id: sessionId, p_answers: payload });

    setSubmitting(false);
    if (error) {
      setError(error.message);
      submittedRef.current = false;
      return;
    }
    setResult(data);
    setMeta((m) => (m ? { ...m, status: 'completed' } : m));
  }, [answers, sessionId]);

  // Countdown timer — auto-submits the moment it reaches zero.
  useEffect(() => {
    if (secondsLeft === null || meta?.status === 'completed') return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, meta?.status, handleSubmit]);

  const totalQuestions = questions.length;
  const current = questions[index];
  const isLast = index === totalQuestions - 1;
  const answeredCount = Object.keys(answers).filter((k) => answers[k]?.trim()).length;

  function setAnswer(value) {
    if (!current) return;
    setAnswers((a) => ({ ...a, [current.id]: value }));
  }

  if (loading) {
    return <p className="py-16 text-center text-sm text-gray-500">Loading your test...</p>;
  }
  if (error) {
    return (
      <div className="rounded-xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
        <p className="mb-3 text-sm text-red-600">{error}</p>
        <Link href="/study-zone/test" className="text-sm font-semibold text-brand-600 hover:underline">
          ← Start a new test
        </Link>
      </div>
    );
  }

  // ---- Results screen ----
  if (result) {
    const pct = result.total_marks > 0 ? Math.round((result.score / result.total_marks) * 100) : 0;
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
        <h2 className="mb-1 text-xl font-bold text-gray-900">Test Completed</h2>
        <p className="mb-6 text-sm text-gray-500">Here's your instant result for the objective portion of this paper.</p>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-brand-50 p-4 text-center">
            <p className="text-2xl font-extrabold text-brand-700">{pct}%</p>
            <p className="text-xs text-gray-500">Score</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4 text-center">
            <p className="text-2xl font-extrabold text-gray-800">
              {result.score}/{result.total_marks}
            </p>
            <p className="text-xs text-gray-500">Marks</p>
          </div>
          <div className="rounded-xl bg-brand-50 p-4 text-center">
            <p className="text-2xl font-extrabold text-brand-700">
              {result.objective_correct}/{result.objective_total}
            </p>
            <p className="text-xs text-gray-500">Objective Correct</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4 text-center">
            <p className="text-2xl font-extrabold text-gray-700">{result.pending_review}</p>
            <p className="text-xs text-gray-500">Awaiting Manual Review</p>
          </div>
        </div>

        <ul className="flex flex-col gap-2">
          {result.breakdown?.map((b, i) => {
            const q = questions.find((qq) => qq.id === b.question_id);
            return (
              <li key={b.question_id} className="rounded-lg border border-gray-100 p-3 text-sm">
                <p className="mb-1 font-medium text-gray-800">
                  Q{i + 1}. {q?.text}
                </p>
                {b.status === 'graded' ? (
                  <p className={b.is_correct ? 'text-brand-600' : 'text-red-600'}>
                    Your answer: {b.given_answer || '(blank)'} {b.is_correct ? '✓ Correct' : `✗ Correct answer: ${b.correct_answer}`}
                  </p>
                ) : (
                  <p className="text-gray-600">Submitted — awaiting manual review ({b.marks} marks)</p>
                )}
              </li>
            );
          })}
        </ul>

        <Link
          href="/study-zone/test"
          className="mt-6 inline-flex items-center gap-1 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
        >
          Take Another Test →
        </Link>
      </div>
    );
  }

  if (!current) {
    return <p className="py-16 text-center text-sm text-gray-500">No questions found for this session.</p>;
  }

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      {/* Timer + progress header */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-t-2xl border-b border-gray-100 bg-white/95 px-5 py-3.5 backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase text-gray-400">
            Question {index + 1} of {totalQuestions}
          </p>
          <p className="text-xs text-gray-400">Answered: {answeredCount}/{totalQuestions}</p>
        </div>
        <div
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold tabular-nums ${
            secondsLeft !== null && secondsLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-brand-50 text-brand-700'
          }`}
        >
          ⏱ {secondsLeft !== null ? formatTime(secondsLeft) : '--:--'}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-gray-100">
        <div
          className="h-1.5 bg-brand-500 transition-all"
          style={{ width: `${((index + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="p-5 md:p-8">
        <span className="mb-3 inline-block rounded bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-brand-600">
          {current.type.replace('_', ' ')} · {current.marks} marks
        </span>
        <p className="mb-5 text-base font-semibold leading-relaxed text-gray-900 md:text-lg">{current.text}</p>

        {current.type === 'mcq' ? (
          <div className="flex flex-col gap-2.5">
            {current.options.map((opt, i) => (
              <label
                key={i}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                  answers[current.id] === opt ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-gray-200 hover:border-brand-200'
                }`}
              >
                <input
                  type="radio"
                  name={`q-${current.id}`}
                  className="h-4 w-4 accent-brand-600"
                  checked={answers[current.id] === opt}
                  onChange={() => setAnswer(opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        ) : current.type === 'long_answer' ? (
          <textarea
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-[3px] focus:ring-brand-100"
            rows={6}
            placeholder="Write your answer here..."
            value={answers[current.id] || ''}
            onChange={(e) => setAnswer(e.target.value)}
          />
        ) : (
          <textarea
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-[3px] focus:ring-brand-100"
            rows={current.type === 'translation' ? 4 : 2}
            placeholder="Type your answer here..."
            value={answers[current.id] || ''}
            onChange={(e) => setAnswer(e.target.value)}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 md:px-8">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
        >
          ← Previous
        </button>

        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Test'}
          </button>
        ) : (
          <button
            onClick={() => setIndex((i) => Math.min(totalQuestions - 1, i + 1))}
            className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            Next Question →
          </button>
        )}
      </div>
    </div>
  );
}
