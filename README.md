# Education & Job Portal

Next.js (App Router) + Tailwind CSS + Supabase.

## 1. Install

```bash
npm install
```

## 2. Set up Supabase

1. Create a project at https://supabase.com.
2. Open **SQL Editor** and run `sql/schema.sql` — it creates all four tables
   (`site_settings`, `hero_slides`, `jobs_table`, `students_data`), sets up
   Row Level Security (public read, authenticated write), and seeds one
   default settings row.
3. Go to **Authentication → Users → Add User** and create your admin
   login (email + password). This is the account you'll use at `/admin`.
   There is no public sign-up form by design — only accounts you create
   in Supabase can log into the dashboard.
4. Go to **Project Settings → API** and copy your **Project URL** and
   **anon public key**.

## 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

## 4. Run

```bash
npm run dev
```

- Home page: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin

## Project structure

```
app/
  layout.js          → root layout, pulls <title> from site_settings
  page.js             → dynamic home page (server component, fetches all 4 tables)
  admin/page.js        → admin dashboard (client component, auth-gated)
components/
  Header.jsx           → logo + responsive nav
  NewsTicker.jsx        → scrolling news bar
  HeroSlider.jsx        → banner/slider fed by hero_slides + site_settings
  SearchBar.jsx          → search input, routes to /search?q=
  JobsList.jsx            → left column: latest jobs
  StudentsZone.jsx         → right column: notes + WhatsApp booking banner
  Footer.jsx                → legal links
  admin/
    AdminLogin.jsx           → Supabase email/password login form
    AdminCard.jsx              → shared card wrapper
    SettingsForm.jsx            → editor for site_settings (single row)
    ListManager.jsx              → generic add/delete list, reused for
                                    hero_slides, jobs_table, students_data
lib/
  supabaseClient.js              → Supabase client (anon key, safe for browser)
sql/
  schema.sql                      → tables + RLS policies + seed row
```

## Notes & next steps

- **Images**: `next.config.js` allows any `https` image host so `logo_url`
  and `hero_slides.image_url` can point anywhere (Supabase Storage,
  Cloudinary, etc.). Narrow `remotePatterns` to your actual host(s) before
  going to production.
- **Search page**: `SearchBar` links to `/search?q=...` — add an
  `app/search/page.js` that queries `jobs_table` and `students_data` with
  `ilike` filters on `title` when you're ready to wire it up.
- **Static pages**: `/jobs`, `/students-zone`, `/results`, `/scholarships`,
  `/contact`, and the footer's legal pages are referenced in the nav but
  not scaffolded here — add an `app/<route>/page.js` for each as needed.
- **WhatsApp number**: `StudentsZone` takes a `whatsappNumber` prop
  (defaults to a placeholder) — pass your real number from `page.js`, or
  add a `whatsapp_number` column to `site_settings` if you want it
  admin-editable too.
- **Auth**: RLS policies require `auth.role() = 'authenticated'` for
  writes, so the admin dashboard's Supabase Auth session is what protects
  your data — the anon key alone can only read.
