import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly in dev if .env.local is missing — much easier to debug
  // than a silent "fetch failed" somewhere deep in a component.
  console.warn(
    'Supabase env vars are missing. Copy .env.local.example to .env.local and fill in your project values.'
  );
}

// This same client is used both in the browser (admin dashboard) and on the
// server (public pages like Contact Us, Jobs, Results — anywhere data is
// fetched during server-side rendering). On the server, Next.js can cache a
// plain `fetch()` call and reuse that cached response for later visitors,
// even on a page marked `dynamic = 'force-dynamic'`. Passing our own fetch
// wrapper that always sets `cache: 'no-store'` guarantees every Supabase
// request — reads and writes — always goes straight to the database, so a
// newly added or deleted row shows up immediately instead of an old
// snapshot lingering until the cache happens to clear.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' }),
  },
});
