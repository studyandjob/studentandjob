# AI Study Zone — Add-on Guide

This adds an AI-powered question bank, an admin question-generation pipeline,
and a live FPSC/PPSC-style exam engine on top of your existing site. Nothing
existing was removed or changed in behavior.

## 1. Run the new SQL

In Supabase → SQL Editor, run **`sql/schema_v3_study_zone.sql`** (after
`schema.sql` and `schema_v2_ai_portal.sql`, which you should already have
run). It creates:

- `classes`, `subjects` — the class/subject picker used everywhere in this
  module.
- `question_bank` — every generated/edited question. Admin-only via RLS;
  no public `select` policy exists on purpose (see "How exam security
  works" below).
- `study_materials` — Guess Papers/Suggestions and Old Papers, class- and
  subject-tagged.
- `student_test_sessions` — one row per attempt.
- Three `security definer` functions — `start_test_session()`,
  `get_test_session()`, `submit_test_session()` — that are the *only* way
  a browser can read a randomized paper or grade a submission. This
  reuses the `is_admin()` helper from `schema_v2_ai_portal.sql`, so no new
  service-role key is needed anywhere.

Safe to re-run.

## 2. Set your AI provider key

Copy `.env.local.example` → `.env.local` (or add to your existing one) and
fill in:

```
AI_PROVIDER=openai            # or "gemini"
OPENAI_API_KEY=sk-...         # if AI_PROVIDER=openai
GEMINI_API_KEY=...            # if AI_PROVIDER=gemini
```

This key is **only ever read server-side**, inside
`app/api/study-zone/generate-questions/route.js` — it's never exposed to
the browser.

## 3. What was added, file by file

| File | Purpose |
|---|---|
| `lib/ai/studyZonePrompt.js` | Builds the AI prompt and parses/validates the JSON it returns |
| `app/api/study-zone/generate-questions/route.js` | Admin-only API route that calls OpenAI/Gemini |
| `components/admin/StudyZone/*` | Admin dashboard tab: Classes & Subjects, Generate (AI), Question Bank browser, Guess/Old Papers manager |
| `lib/data.js` | Added `getStudyClasses`, `getStudySubjects`, `getStudyMaterials` |
| `app/study-zone/page.js` | Public landing page with the 3 action cards |
| `app/study-zone/test/page.js` + `TestSetupForm.jsx` | Class/subject/type/duration picker that starts a session |
| `app/study-zone/test/[sessionId]/page.js` + `ExamRunner.jsx` | The live exam UI — timer, one question at a time, auto-submit |
| `app/study-zone/materials/page.js` | Guess Papers & Old Papers browser, filterable by class |

Sidebar and `app/admin/page.js` were updated to add the **Study Zone (AI)**
menu item.

## 4. How the AI question generation pipeline works

Admin dashboard → **Study Zone (AI) → Generate Questions (AI)**:

1. Select a Class → Subject, name the chapter, and paste (or upload a
   `.txt` export of) the chapter content.
2. Set how many of each question type you want (MCQ, Fill in the Blank,
   Short Answer, Long Answer, Translation).
3. Click **Generate Questions with AI**. The API route builds a
   structured prompt, calls your configured AI provider, and parses the
   JSON response.
4. Review/edit every generated question inline (text, options, correct
   answer, marks) — nothing is saved yet.
5. Click **Save to Question Bank** — this inserts the rows directly from
   the browser using the logged-in admin's own Supabase session (checked
   against `is_admin()` by RLS), the same way every other admin list in
   this dashboard already saves data.

> **Note on PDFs:** the generation route takes plain text. A `.txt` upload
> or paste both work today; wiring up PDF text extraction (e.g. via a
> `pdf-parse`-style library) is a good next step if most of your chapter
> content lives in PDFs.

## 5. How exam security works (no login wall, but no leaked answers)

Taking a practice test doesn't require a Supabase Auth account — matching
how real FPSC/PPSC practice sites work. Instead:

- `start_test_session()` randomly picks questions from `question_bank`,
  **strips `correct_answer` before returning them**, and stores exactly
  which question ids were served on the new `student_test_sessions` row.
- The browser never queries `question_bank` directly — RLS has no public
  `select` policy on it at all.
- `submit_test_session()` re-reads the *real* row (with the answer key)
  server-side inside Postgres, grades MCQ/Fill-in-the-Blank/Translation
  instantly, and marks Short/Long Answer as `pending_review` for a human
  to mark later.
- Direct `insert`/`update` on `student_test_sessions` is blocked for
  everyone except admins — all writes go through the two functions above,
  so a student can't rewrite their own score by editing the request.

## 6. Adding content

Before students can test themselves, an admin needs to:

1. Add at least one Class and Subject (**Study Zone → Classes & Subjects**).
2. Generate and save questions for that Class/Subject via the AI pipeline
   (or insert manually into `question_bank` with `source = 'manual'`).
3. Optionally add Guess Papers / Old Papers PDFs (**Study Zone → Guess &
   Old Papers**) — same "paste a file URL" pattern as the existing
   Students Zone notes manager.

## 7. Notes / things you may want to adjust

- **Question counts per test** are 10/20/30/50 in `TestSetupForm.jsx` —
  change the `QUESTION_COUNT_OPTIONS` array if you want different sizes.
- **Durations** are 15/30/45/60 minutes — same file, `DURATION_OPTIONS`.
- There's currently no limit on how many times the same visitor can retake
  a test, and no result history view for a given student (sessions are
  identified only by their own URL). If you want a leaderboard, per-
  student history, or a hard "one attempt" rule, that needs a real
  identity (Supabase Auth or at least a phone/email + OTP) tied to
  `student_test_sessions`.
- **Short/Long Answer grading** is manual by design — there's no admin UI
  yet to review `pending_review` answers and enter a mark. That's a
  natural next addition: a "Pending Reviews" tab reading
  `student_test_sessions.result->breakdown` where `status = 'pending_review'`.
