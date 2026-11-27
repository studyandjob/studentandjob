'use client';

// Shared (one fetch for every component) view of the signed-in business owner
// and their listings, plus the notification-style items shown in the header's
// profile menu. Nothing here is stored server-side except the listings
// themselves; "seen" marks live in this browser only.

import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

let state = { ready: false, user: null, businesses: [] };
const subs = new Set();
let started = false;

function emit() {
  subs.forEach((f) => f(state));
}

async function load(session) {
  if (!session) {
    state = { ready: true, user: null, businesses: [] };
    return emit();
  }
  const { data } = await supabase
    .from('businesses_table')
    .select('id, name, listing_status, admin_note, profile_type')
    .eq('owner_id', session.user.id)
    .order('updated_at', { ascending: false });
  state = { ready: true, user: session.user, businesses: data || [] };
  emit();
}

function start() {
  if (started) return;
  started = true;
  supabase.auth.getSession().then(({ data }) => load(data.session));
  // Deferred: calling Supabase straight from inside this callback can deadlock.
  supabase.auth.onAuthStateChange((_event, session) => setTimeout(() => load(session), 0));
}

export function useOwnerAccount() {
  const [s, setS] = useState(state);
  useEffect(() => {
    start();
    subs.add(setS);
    setS(state);
    return () => subs.delete(setS);
  }, []);
  return s;
}

export function refreshOwnerAccount() {
  return supabase.auth.getSession().then(({ data }) => load(data.session));
}

// ---- notifications derived from the owner's listings --------------------
export function buildNotifications(businesses = []) {
  const items = [];
  if (businesses.length === 0) {
    items.push({
      key: 'setup',
      tone: 'brand',
      art: 'shop',
      title: 'Add your business',
      text: 'Apna business setup karein — sirf chand minute lagte hain.',
      href: '/business/new',
    });
  }
  for (const b of businesses) {
    const name = b.name || 'Aap ka business';
    const edit = `/business/edit/${b.id}`;
    if (b.listing_status === 'draft') items.push({ key: `${b.id}:draft`, tone: 'brand', art: 'shop', title: 'Setup adhoora hai', text: `${name} — jaari rakhein`, href: edit });
    else if (b.listing_status === 'pending') items.push({ key: `${b.id}:pending`, tone: 'amber', art: 'doc', title: 'Review mein hai', text: `${name} admin ke review mein hai`, href: '/business/dashboard' });
    else if (b.listing_status === 'published') items.push({ key: `${b.id}:published`, tone: 'green', art: 'shield', title: 'Aap ki listing live hai', text: `${name} ab website par nazar aa rahi hai`, href: '/business/dashboard' });
    else if (b.listing_status === 'rejected') items.push({ key: `${b.id}:rejected`, tone: 'red', art: 'bell', title: 'Tabdeeli darkar hai', text: `${name}: ${b.admin_note || 'maloomat dobara check karein'}`, href: edit });
    else if (b.listing_status === 'banned') items.push({ key: `${b.id}:banned`, tone: 'red', art: 'bell', title: 'Listing band kar di gayi', text: `${name}${b.admin_note ? `: ${b.admin_note}` : ''}`, href: '/business/dashboard' });
  }
  return items;
}

// ---- "seen" marks (this browser only) ------------------------------------
const SEEN_KEY = 'dir_seen_notes';
const readSeen = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'));
  } catch {
    return new Set();
  }
};

export function markNotificationSeen(key) {
  try {
    const s = readSeen();
    s.add(key);
    localStorage.setItem(SEEN_KEY, JSON.stringify([...s].slice(-200)));
    window.dispatchEvent(new Event('dir-seen-change'));
  } catch {}
}

export function useSeen() {
  const [seen, setSeen] = useState(() => new Set());
  useEffect(() => {
    const sync = () => setSeen(readSeen());
    sync();
    window.addEventListener('dir-seen-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('dir-seen-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return seen;
}
