import { createClient } from '@supabase/supabase-js';

// SERVER-ONLY. This uses the service role key, which bypasses Row Level
// Security entirely — it must never be imported into a 'use client'
// component or anywhere else that ships to the browser. Only import this
// from files under app/api/**/route.js or server helpers they call.
//
// The client is created lazily, on the first real request that uses it —
// NOT when the file is imported. Creating it at import time made
// `next build` crash ("supabaseKey is required") whenever
// SUPABASE_SERVICE_ROLE_KEY was not set yet, which broke the whole
// deployment even though only the staff create/delete routes need the key.
let client = null;

function getClient() {
  if (client) return client;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is missing. Add it in Vercel → Project Settings → Environment Variables ' +
        '(Supabase → Project Settings → API → service_role secret), then redeploy. Never expose it as NEXT_PUBLIC_*.'
    );
  }
  client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}

// Same usage as before (supabaseAdmin.auth..., supabaseAdmin.from(...)),
// but the real client only exists once a request actually needs it.
export const supabaseAdmin = new Proxy(
  {},
  {
    get(_target, prop) {
      const c = getClient();
      const value = c[prop];
      return typeof value === 'function' ? value.bind(c) : value;
    },
  }
);
