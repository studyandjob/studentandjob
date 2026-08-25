import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildStudyZonePrompt, parseStudyZoneResponse } from '@/lib/ai/studyZonePrompt';

// This route only ever talks to the AI provider — it never writes to
// question_bank itself. It returns the generated questions to the admin
// dashboard, which inserts them using the logged-in admin's own Supabase
// session (RLS-checked via is_admin()). That means no service-role key
// is needed anywhere in this project; the only new secret this feature
// needs is the AI provider key below.

const MAX_CHAPTER_CHARS = 18000; // keeps prompts within a safe token budget

async function requireAdmin(request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return false;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return false;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await supabase.rpc('is_admin');
  if (error) return false;
  return data === true;
}

async function callOpenAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured on the server.');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You generate exam questions and reply with raw JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenAI request failed (${res.status}): ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured on the server.');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: 'You generate exam questions and reply with raw JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_completion_tokens: 4000,
    }),
  });

  if (res.status === 413) {
    throw new Error('Too many questions requested for your Groq plan\'s per-minute token limit. Request fewer questions per run (try 15-20 total), use shorter chapter text, or upgrade to Groq\'s Dev Tier for higher limits.');
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Groq request failed (${res.status}): ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const choice = data?.choices?.[0];
  if (choice?.finish_reason === 'length') {
    throw new Error('The AI response was cut off before finishing (too many questions requested at once). Try requesting fewer questions per run.');
  }
  return choice?.message?.content || '';
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured on the server.');

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6 },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Gemini request failed (${res.status}): ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
}

export async function POST(request) {
  try {
    const isAdmin = await requireAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin login required.' }, { status: 401 });
    }

    const body = await request.json();
    const { className, subjectName, chapterName, chapterText, counts } = body || {};

    if (!className || !subjectName || !chapterName || !chapterText) {
      return NextResponse.json({ error: 'className, subjectName, chapterName and chapterText are all required.' }, { status: 400 });
    }
    if (chapterText.trim().length < 200) {
      return NextResponse.json({ error: 'Chapter text looks too short to generate good questions from — paste more content.' }, { status: 400 });
    }

    const safeCounts = {
      mcq: Number(counts?.mcq) || 0,
      fill_in_blank: Number(counts?.fill_in_blank) || 0,
      short_answer: Number(counts?.short_answer) || 0,
      long_answer: Number(counts?.long_answer) || 0,
      translation: Number(counts?.translation) || 0,
    };
    const totalRequested = Object.values(safeCounts).reduce((a, b) => a + b, 0);
    if (totalRequested < 1) {
      return NextResponse.json({ error: 'Select at least one question type and count.' }, { status: 400 });
    }
    if (totalRequested > 200) {
      return NextResponse.json({ error: 'Please request 200 questions or fewer per generation run (call it again for more).' }, { status: 400 });
    }

    const prompt = buildStudyZonePrompt({
      className,
      subjectName,
      chapterName,
      chapterText: chapterText.slice(0, MAX_CHAPTER_CHARS),
      counts: safeCounts,
    });

    const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
    let rawText;
    if (provider === 'gemini') {
      rawText = await callGemini(prompt);
    } else if (provider === 'groq') {
      rawText = await callGroq(prompt);
    } else {
      rawText = await callOpenAI(prompt);
    }

    const questions = parseStudyZoneResponse(rawText);
    if (questions.length === 0) {
      return NextResponse.json({ error: 'The AI model did not return any usable questions. Try again.' }, { status: 502 });
    }

    return NextResponse.json({ questions, requested: totalRequested, received: questions.length });
  } catch (err) {
    console.error('generate-questions error:', err);
    return NextResponse.json({ error: err.message || 'Question generation failed.' }, { status: 500 });
  }
}
