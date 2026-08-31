// Small shared data-fetching helpers so every page (home, jobs, results,
// scholarships, students-zone, contact, static pages) reads Supabase the
// same way instead of repeating the same queries everywhere.

import { supabase } from './supabaseClient';

export async function getSiteSettings() {
  // Explicitly order by most-recently-updated first. Without this, if more
  // than one row ever exists in this "single row config" table (e.g. an
  // early save happened before the table had its first seeded row, creating
  // a second row), Supabase has no guaranteed order and can return an old
  // row — making a just-saved change look like it "reset" on refresh.
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .order('updated_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  return data || {};
}

export async function getJobs(limit) {
  let query = supabase.from('jobs_table').select('*').order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data } = await query;
  return data || [];
}

export async function getNotes(limit) {
  let query = supabase.from('students_data').select('*').order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data } = await query;
  return data || [];
}

export async function getResults(limit) {
  let query = supabase.from('results_table').select('*').order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data } = await query;
  return data || [];
}

export async function getScholarships(limit) {
  let query = supabase.from('scholarships_table').select('*').order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data } = await query;
  return data || [];
}

export async function getTestimonials(limit) {
  let query = supabase
    .from('testimonials_table')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data } = await query;
  return data || [];
}

// Real, live counts for the homepage stats strip — no hardcoded marketing
// numbers. Uses head:true so Supabase returns only the row count, not the
// actual rows (cheap even as these tables grow).
export async function getHomeStats() {
  const [jobs, notes, scholarships, results, settings] = await Promise.all([
    supabase.from('jobs_table').select('id', { count: 'exact', head: true }),
    supabase.from('students_data').select('id', { count: 'exact', head: true }),
    supabase.from('scholarships_table').select('id', { count: 'exact', head: true }),
    supabase.from('results_table').select('id', { count: 'exact', head: true }),
    supabase
      .from('site_settings')
      .select('stats_jobs_boost, stats_notes_boost, stats_scholarships_boost, stats_results_boost')
      .order('updated_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const boosts = settings.data || {};

  // Displayed count = live row count + an optional admin-set "boost" (Admin
  // → Website Settings). This lets the homepage show a realistic-looking
  // number from day one instead of "0 Notes & Papers" while the site is
  // still small, and admins can raise/lower it honestly as real content
  // grows. Any category still at 0 after the boost is hidden entirely by
  // StatsStrip rather than shown as "0 ...".
  return {
    jobs: (jobs.count || 0) + (boosts.stats_jobs_boost || 0),
    notes: (notes.count || 0) + (boosts.stats_notes_boost || 0),
    scholarships: (scholarships.count || 0) + (boosts.stats_scholarships_boost || 0),
    results: (results.count || 0) + (boosts.stats_results_boost || 0),
  };
}

export async function getContacts() {
  const { data } = await supabase.from('site_contacts').select('*').order('display_order', { ascending: true });
  return data || [];
}

export async function getPage(slug) {
  const { data } = await supabase.from('site_pages').select('*').eq('slug', slug).maybeSingle();
  return data;
}

// --- Study Zone -------------------------------------------------------

export async function getStudyClasses() {
  const { data } = await supabase.from('classes').select('*').order('display_order', { ascending: true });
  return data || [];
}

export async function getStudySubjects(classId) {
  let query = supabase.from('subjects').select('*').order('subject_name', { ascending: true });
  if (classId) query = query.eq('class_id', classId);
  const { data } = await query;
  return data || [];
}

export async function getStudyMaterials(materialType, classId) {
  let query = supabase.from('study_materials').select('*').order('created_at', { ascending: false });
  if (materialType) query = query.eq('material_type', materialType);
  if (classId) query = query.eq('class_id', classId);
  const { data } = await query;
  return data || [];
}
