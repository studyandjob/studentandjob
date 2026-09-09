import { createClient } from '@supabase/supabase-js';

// SERVER-ONLY. This uses the service role key, which bypasses Row Level
// Security entirely — it must never be imported into a 'use client'
// component or anywhere else that ships to the browser. Only import this
// from files under app/api/**/route.js (Next.js keeps route handlers
// server-side by design).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    'SUPABASE_SERVICE_ROLE_KEY is missing — staff create/delete API routes will fail. ' +
      'Add it in your environment (Vercel → Project Settings → Environment Variables), ' +
      'found in Supabase → Project Settings → API → service_role (secret). Never expose it as NEXT_PUBLIC_*.'
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
