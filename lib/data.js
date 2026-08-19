// Small shared data-fetching helpers so every page (home, jobs, results,
// scholarships, students-zone, contact, static pages) reads Supabase the
// same way instead of repeating the same queries everywhere.

import { supabase } from './supabaseClient';

export async function getSiteSettings() {
  const { data } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
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

export async function getContacts() {
  const { data } = await supabase.from('site_contacts').select('*').order('display_order', { ascending: true });
  return data || [];
}

export async function getPage(slug) {
  const { data } = await supabase.from('site_pages').select('*').eq('slug', slug).maybeSingle();
  return data;
}
