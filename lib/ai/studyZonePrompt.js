// Prompt + response parsing for the "Generate Questions with AI" pipeline.
// Kept separate from the API route so the prompt itself is easy to tune
// without touching request/response plumbing.

const TYPE_LABELS = {
  mcq: 'Multiple Choice Question (exactly 4 options, one correct)',
  fill_in_blank: 'Fill in the Blank',
  short_answer: 'Short Answer Question (2-3 sentence expected answer)',
  long_answer: 'Long Answer Question (essay-style, no single correct_answer)',
  translation: 'Translation Paragraph (English to Urdu or Urdu to English)',
};

export function buildStudyZonePrompt({ className, subjectName, chapterName, chapterText, counts }) {
  const requestedTypes = Object.entries(counts)
    .filter(([, n]) => Number(n) > 0)
    .map(([type, n]) => `- ${n} x ${TYPE_LABELS[type] || type}`)
    .join('\n');

  return `You are an expert ${subjectName} teacher setting exam questions for ${className} students in Pakistan, in the style of official board exams and FPSC/PPSC-style tests.

Chapter: "${chapterName}"

Source chapter content (use ONLY this content to write questions; do not invent facts outside it):
"""
${chapterText}
"""

Generate exam questions strictly in these quantities and types:
${requestedTypes}

Rules:
- MCQs must have exactly 4 plausible options in "options", with "correct_answer" being the exact text of the correct option.
- Fill in the blank: put a single blank as "____" inside "question_text", and "correct_answer" is the exact missing word/phrase.
- Short/Long answer: "correct_answer" should be a brief model answer or key points (for the admin's reference), "options" must be an empty array.
- Translation: "question_text" is the paragraph to translate (state the direction, e.g. "Translate into Urdu: ..."), "correct_answer" is a reference translation, "options" must be an empty array.
- Vary difficulty and cover different parts of the chapter — do not repeat near-identical questions.
- Write question_text and options in clear, exam-appropriate language (English, unless the subject itself is Urdu/Islamiat-in-Urdu, in which case write in Urdu).
- "marks" should be a reasonable integer for that question type (e.g. mcq=1, fill_in_blank=1, short_answer=3, long_answer=5, translation=5).

Respond with ONLY a raw JSON array (no markdown fences, no commentary, no surrounding text) where each item has exactly this shape:
{"question_type": "mcq|fill_in_blank|short_answer|long_answer|translation", "question_text": "string", "options": ["string", ...], "correct_answer": "string", "marks": number}`;
}

export function parseStudyZoneResponse(rawText) {
  if (!rawText) throw new Error('Empty response from AI model.');

  // Models sometimes wrap JSON in ```json ... ``` fences despite instructions.
  let cleaned = rawText.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) cleaned = fenceMatch[1].trim();

  // Fall back to slicing from the first [ to the last ] if there's stray text.
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    // Response may have been cut off mid-array. Salvage whichever complete
    // {...} objects are present at the top level instead of failing outright.
    const objectMatches = cleaned.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g) || [];
    const salvaged = [];
    for (const chunk of objectMatches) {
      try {
        salvaged.push(JSON.parse(chunk));
      } catch (_) {
        // skip the broken trailing object
      }
    }
    if (salvaged.length === 0) {
      throw new Error('Could not parse the AI model\'s response as JSON. Try again or request fewer questions per run.');
    }
    parsed = salvaged;
  }

  if (!Array.isArray(parsed)) throw new Error('AI response was not a JSON array of questions.');

  const validTypes = new Set(['mcq', 'fill_in_blank', 'short_answer', 'long_answer', 'translation']);

  return parsed
    .filter((q) => q && typeof q.question_text === 'string' && q.question_text.trim() && validTypes.has(q.question_type))
    .map((q) => ({
      question_type: q.question_type,
      question_text: String(q.question_text).trim(),
      options: q.question_type === 'mcq' && Array.isArray(q.options) ? q.options.map((o) => String(o)) : [],
      correct_answer: q.correct_answer != null ? String(q.correct_answer).trim() : null,
      marks: Number.isFinite(Number(q.marks)) && Number(q.marks) > 0 ? Number(q.marks) : 1,
    }));
}
