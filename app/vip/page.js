'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import VipAuth from '@/components/vip/VipAuth';
import VipDashboard from '@/components/vip/VipDashboard';

export default function VipPortalPage() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = logged out
  const [siteName, setSiteName] = useState('');
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [request, setRequest] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('site_name')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setSiteName(data?.site_name || ''));
  }, []);

  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoadingData(true);
      const [{ data: p }, { data: j }, { data: r }] = await Promise.all([
        supabase.from('candidate_profiles').select('*').eq('user_id', session.user.id).maybeSingle(),
        supabase.from('jobs_table').select('*').order('created_at', { ascending: false }),
        supabase
          .from('member_requests')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      setProfile(p);
      setJobs(j || []);
      setRequest(r);
      setLoadingData(false);
    })();
  }, [session]);

  if (session === undefined) {
    return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  }

  if (!session) {
    return <VipAuth onAuthed={setSession} siteName={siteName} />;
  }

  if (loadingData) {
    return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading your dashboard…</div>;
  }

  return <VipDashboard session={session} initialProfile={profile} jobs={jobs} initialRequest={request} siteName={siteName} />;
}
