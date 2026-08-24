-- ============================================================
-- AI Study Zone — Schema Add-on (v3)
-- Run this AFTER sql/schema.sql and sql/schema_v2_ai_portal.sql
-- in the Supabase SQL Editor. Safe to re-run.
--
-- Adds: classes, subjects, question_bank, study_materials
-- (guess papers / old papers), student_test_sessions, and two
-- SECURITY DEFINER functions (start_test_session /
-- submit_test_session) that are the ONLY way a browser can ever
-- read a randomized paper or grade a submission — this is what
-- keeps `correct_answer` out of reach of students taking a test,
-- without needing a service-role key anywhere in the app.
-- ============================================================

-- ------------------------------------------------------------
-- 1. CLASSES  (9th, 10th, 1st Year, 2nd Year, ...)
-- ------------------------------------------------------------
create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  class_name text not null unique,
  display_order int not null default 0,
  created_at timestamptz default now()
);

alter table classes enable row level security;

drop policy if exists "Public can read classes" on classes;
create policy "Public can read classes" on classes for select using (true);

drop policy if exists "Admins can manage classes" on classes;
create policy "Admins can manage classes" on classes for all
  using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- 2. SUBJECTS  (English, Mathematics, ... per class)
-- ------------------------------------------------------------
create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  subject_name text not null,
  created_at timestamptz default now(),
  unique (class_id, subject_name)
);

create index if not exists idx_subjects_class on subjects (class_id);

alter table subjects enable row level security;

drop policy if exists "Public can read subjects" on subjects;
create policy "Public can read subjects" on subjects for select using (true);

drop policy if exists "Admins can manage subjects" on subjects;
create policy "Admins can manage subjects" on subjects for all
  using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- 3. QUESTION BANK
-- ------------------------------------------------------------
-- question_type: 'mcq' | 'fill_in_blank' | 'short_answer' |
--                 'long_answer' | 'translation'
-- options: jsonb array of strings, only used for 'mcq'
-- correct_answer: for mcq = the exact option text; for
--   fill_in_blank/translation = expected text (matched loosely
--   by the grading function); left blank for short/long answer
--   (those are marked "pending review", not auto-graded).
create table if not exists question_bank (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  chapter_name text,
  question_type text not null default 'mcq'
    check (question_type in ('mcq', 'fill_in_blank', 'short_answer', 'long_answer', 'translation')),
  question_text text not null,
  options jsonb default '[]'::jsonb,
  correct_answer text,
  marks numeric not null default 1,
  source text default 'ai',              -- 'ai' | 'manual'
  created_at timestamptz default now()
);

create index if not exists idx_qb_class_subject on question_bank (class_id, subject_id);
create index if not exists idx_qb_type on question_bank (question_type);

alter table question_bank enable row level security;

-- NOTE: there is intentionally NO public select policy here.
-- Students never query this table directly — the exam UI only
-- ever sees questions (never correct_answer) through the
-- start_test_session() function below. Admins manage it directly
-- from the dashboard.
drop policy if exists "Admins can manage question_bank" on question_bank;
create policy "Admins can manage question_bank" on question_bank for all
  using (is_admin()) with check (is_admin());

-- A safe view the admin dashboard can also use for review lists;
-- kept identical to the base table today but gives us a single
-- place to redact fields later without touching every query.
create or replace view question_bank_admin_view as
  select * from question_bank;

-- ------------------------------------------------------------
-- 4. STUDY MATERIALS  (Guess Papers & Suggestions / Old Papers)
-- ------------------------------------------------------------
create table if not exists study_materials (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  material_type text not null default 'guess_paper'
    check (material_type in ('guess_paper', 'old_paper')),
  title text not null,
  year text,                              -- e.g. '2025' for old papers
  file_url text not null,
  created_at timestamptz default now()
);

create index if not exists idx_study_materials_lookup on study_materials (material_type, class_id, subject_id);

alter table study_materials enable row level security;

drop policy if exists "Public can read study_materials" on study_materials;
create policy "Public can read study_materials" on study_materials for select using (true);

drop policy if exists "Admins can manage study_materials" on study_materials;
create policy "Admins can manage study_materials" on study_materials for all
  using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- 5. STUDENT TEST SESSIONS
-- ------------------------------------------------------------
-- No login is required to take a practice test (matches how real
-- FPSC/PPSC-style practice sites work) — a session is identified
-- by its own uuid, which the browser holds onto. question_ids is
-- the exact randomized paper that was served, so re-fetching or
-- submitting always grades the same set that was shown.
create table if not exists student_test_sessions (
  id uuid primary key default gen_random_uuid(),
  student_name text,
  class_id uuid references classes(id) on delete set null,
  subject_id uuid references subjects(id) on delete set null,
  question_ids uuid[] not null default '{}',
  duration_minutes int not null default 30,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'expired')),
  answers jsonb default '[]'::jsonb,           -- [{question_id, answer}]
  result jsonb,                                -- graded breakdown, see submit_test_session()
  total_marks numeric,
  score numeric,
  created_at timestamptz default now()
);

create index if not exists idx_sessions_status on student_test_sessions (status);

alter table student_test_sessions enable row level security;

-- Reading your own session (by its unpredictable uuid) is fine —
-- there's nothing here an anonymous visitor couldn't already see
-- via the exam UI itself once the test is running.
drop policy if exists "Public can read a session by id" on student_test_sessions;
create policy "Public can read a session by id" on student_test_sessions for select using (true);

-- Admins get a normal dashboard view (e.g. for a future "test
-- activity" tab); ordinary insert/update from the browser is
-- deliberately blocked — every mutation goes through the two
-- SECURITY DEFINER functions below so a student can never rewrite
-- their own score or peek at answers by editing the request.
drop policy if exists "Admins can manage sessions" on student_test_sessions;
create policy "Admins can manage sessions" on student_test_sessions for all
  using (is_admin()) with check (is_admin());

-- ------------------------------------------------------------
-- 6. start_test_session()
-- ------------------------------------------------------------
-- Builds a randomized paper from question_bank, stores which
-- question ids were served (so grading later can't be gamed), and
-- returns the questions WITHOUT correct_answer.
drop function if exists start_test_session(uuid, uuid, int, int, text, text[]);
create or replace function start_test_session(
  p_class_id uuid,
  p_subject_id uuid,
  p_question_count int default 20,
  p_duration_minutes int default 30,
  p_student_name text default null,
  p_question_types text[] default null   -- null = any type
)
returns table (
  session_id uuid,
  duration_minutes int,
  question_id uuid,
  question_type text,
  question_text text,
  options jsonb,
  marks numeric,
  chapter_name text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session_id uuid;
  v_question_ids uuid[];
begin
  if p_question_count is null or p_question_count < 1 then
    p_question_count := 20;
  end if;
  if p_duration_minutes is null or p_duration_minutes < 1 then
    p_duration_minutes := 30;
  end if;

  select array_agg(q.id) into v_question_ids
  from (
    select id from question_bank
    where class_id = p_class_id
      and subject_id = p_subject_id
      and (p_question_types is null or question_type = any (p_question_types))
    order by random()
    limit p_question_count
  ) q;

  if v_question_ids is null or array_length(v_question_ids, 1) is null then
    raise exception 'No questions available yet for this class/subject.';
  end if;

  insert into student_test_sessions (student_name, class_id, subject_id, question_ids, duration_minutes)
  values (p_student_name, p_class_id, p_subject_id, v_question_ids, p_duration_minutes)
  returning id into v_session_id;

  return query
    select
      v_session_id,
      p_duration_minutes,
      qb.id,
      qb.question_type,
      qb.question_text,
      qb.options,
      qb.marks,
      qb.chapter_name
    from question_bank qb
    where qb.id = any (v_question_ids)
    order by array_position(v_question_ids, qb.id);
end;
$$;

grant execute on function start_test_session(uuid, uuid, int, int, text, text[]) to anon, authenticated;

-- ------------------------------------------------------------
-- 6b. get_test_session()
-- ------------------------------------------------------------
-- Re-fetches an already-started session's paper (again, WITHOUT
-- correct_answer) — used when the exam page loads or is refreshed,
-- so the countdown/paper survive a reload instead of being lost.
drop function if exists get_test_session(uuid);
create or replace function get_test_session(p_session_id uuid)
returns table (
  session_id uuid,
  student_name text,
  status text,
  started_at timestamptz,
  duration_minutes int,
  question_id uuid,
  question_type text,
  question_text text,
  options jsonb,
  marks numeric,
  chapter_name text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    s.id,
    s.student_name,
    s.status,
    s.started_at,
    s.duration_minutes,
    qb.id,
    qb.question_type,
    qb.question_text,
    qb.options,
    qb.marks,
    qb.chapter_name
  from student_test_sessions s
  join question_bank qb on qb.id = any (s.question_ids)
  where s.id = p_session_id
  order by array_position(s.question_ids, qb.id);
$$;

grant execute on function get_test_session(uuid) to anon, authenticated;

-- ------------------------------------------------------------
-- 7. submit_test_session()
-- ------------------------------------------------------------
-- p_answers: jsonb array like [{"question_id": "...", "answer": "..."}]
-- Auto-grades mcq / fill_in_blank / translation by comparing
-- (trimmed, case-insensitive) text to correct_answer. short_answer
-- and long_answer are recorded but flagged "pending_review" since
-- they need a human to mark them — matches the brief's "instant
-- evaluation for objective parts" requirement.
drop function if exists submit_test_session(uuid, jsonb);
create or replace function submit_test_session(
  p_session_id uuid,
  p_answers jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session student_test_sessions%rowtype;
  v_question question_bank%rowtype;
  v_answer_row jsonb;
  v_given text;
  v_is_correct boolean;
  v_score numeric := 0;
  v_total_marks numeric := 0;
  v_objective_total int := 0;
  v_objective_correct int := 0;
  v_pending_review int := 0;
  v_breakdown jsonb := '[]'::jsonb;
begin
  select * into v_session from student_test_sessions where id = p_session_id;
  if not found then
    raise exception 'Test session not found.';
  end if;
  if v_session.status = 'completed' then
    return v_session.result;
  end if;

  for v_question in
    select * from question_bank where id = any (v_session.question_ids)
  loop
    v_answer_row := (
      select a from jsonb_array_elements(coalesce(p_answers, '[]'::jsonb)) a
      where (a->>'question_id')::uuid = v_question.id
      limit 1
    );
    v_given := nullif(trim(coalesce(v_answer_row->>'answer', '')), '');
    v_total_marks := v_total_marks + coalesce(v_question.marks, 1);

    if v_question.question_type in ('mcq', 'fill_in_blank', 'translation') then
      v_objective_total := v_objective_total + 1;
      v_is_correct := v_given is not null
        and v_question.correct_answer is not null
        and lower(trim(v_given)) = lower(trim(v_question.correct_answer));
      if v_is_correct then
        v_objective_correct := v_objective_correct + 1;
        v_score := v_score + coalesce(v_question.marks, 1);
      end if;
      v_breakdown := v_breakdown || jsonb_build_object(
        'question_id', v_question.id,
        'question_type', v_question.question_type,
        'given_answer', v_given,
        'correct_answer', v_question.correct_answer,
        'is_correct', coalesce(v_is_correct, false),
        'marks', v_question.marks,
        'status', 'graded'
      );
    else
      v_pending_review := v_pending_review + 1;
      v_breakdown := v_breakdown || jsonb_build_object(
        'question_id', v_question.id,
        'question_type', v_question.question_type,
        'given_answer', v_given,
        'marks', v_question.marks,
        'status', 'pending_review'
      );
    end if;
  end loop;

  update student_test_sessions
  set status = 'completed',
      completed_at = now(),
      answers = coalesce(p_answers, '[]'::jsonb),
      total_marks = v_total_marks,
      score = v_score,
      result = jsonb_build_object(
        'score', v_score,
        'total_marks', v_total_marks,
        'objective_total', v_objective_total,
        'objective_correct', v_objective_correct,
        'pending_review', v_pending_review,
        'breakdown', v_breakdown
      )
  where id = p_session_id
  returning result into v_breakdown;

  return v_breakdown;
end;
$$;

grant execute on function submit_test_session(uuid, jsonb) to anon, authenticated;

-- ------------------------------------------------------------
-- 8. auto-expire a session whose timer has clearly run out
-- ------------------------------------------------------------
-- Called defensively by the client if it ever loads a stale
-- in-progress session after the countdown would have hit zero.
drop function if exists expire_test_session(uuid);
create or replace function expire_test_session(p_session_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update student_test_sessions
  set status = 'expired', completed_at = now()
  where id = p_session_id
    and status = 'in_progress'
    and started_at + (duration_minutes || ' minutes')::interval < now();
$$;

grant execute on function expire_test_session(uuid) to anon, authenticated;
