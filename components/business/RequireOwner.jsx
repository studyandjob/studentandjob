'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// Sends visitors without a session to the login page, then back here.
export default function RequireOwner({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const toLogin = () => router.replace(`/business/login?next=${encodeURIComponent(pathname || '/business/dashboard')}`);
    supabase.auth.getSession().then(({ data }) => (data.session ? setOk(true) : toLogin()));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) toLogin();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, pathname]);

  if (!ok) return <p className="py-16 text-center text-sm text-gray-500">Check ho raha hai...</p>;
  return children;
}
