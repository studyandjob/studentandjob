# Education & Job Portal

Next.js (App Router) + Tailwind CSS + Supabase.

## 1. Install

```bash
npm install
```

## 2. Set up Supabase

1. Create a project at https://supabase.com.
2. Open **SQL Editor** and run `sql/schema.sql` — it creates all eight tables
   (`site_settings`, `hero_slides`, `jobs_table`, `students_data`,
   `results_table`, `scholarships_table`, `contact_messages`, `site_pages`),
   sets up Row Level Security (public read, authenticated write — except
   `contact_messages`, where the public can only submit, not read), and
   seeds a default settings row plus the four static page rows (About Us,
   Privacy Policy, Disclaimer, Terms & Conditions).
   > If you ran an earlier version of this schema already, just run the
   > new `create table` / `create policy` / `insert` statements for the
   > four new tables — they all use `if not exists` / `on conflict do
   > nothing` so it's safe to re-run the whole file.
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
  layout.js                  → root layout, pulls <title> from site_settings
  page.js                     → home page (server component)
  jobs/page.js                 → full Jobs listing
  students-zone/page.js         → full Students Zone listing
  results/page.js                → Results listing
  scholarships/page.js            → Scholarships listing
  contact/page.js                  → Contact Us page (form → contact_messages)
  about-us/page.js                  → editable static page (site_pages)
  privacy-policy/page.js             → editable static page (site_pages)
  disclaimer/page.js                  → editable static page (site_pages)
  terms-and-conditions/page.js         → editable static page (site_pages)
  admin/page.js                         → admin dashboard (client component, auth-gated)
components/
  Header.jsx                → logo + responsive nav (Home, Jobs, Students Zone,
                               Results, Scholarships, Contact Us)
  NewsTicker.jsx              → scrolling news bar
  HeroSlider.jsx                → banner/slider fed by hero_slides + site_settings
  SearchBar.jsx                   → search input, routes to /search?q=
  JobsList.jsx                      → home page: latest jobs preview
  StudentsZone.jsx                    → home page: notes preview + WhatsApp banner
  PageBanner.jsx                        → shared page-title banner for listing pages
  ContactForm.jsx                         → contact form → inserts into contact_messages
  StaticPageContent.jsx                     → shared renderer for the 4 legal/about pages
  Footer.jsx                                 → legal links
  admin/
    AdminLogin.jsx                           → Supabase email/password login form
    AdminCard.jsx                              → shared card wrapper
    SettingsForm.jsx                             → editor for site_settings (single row)
    ListManager.jsx                                → generic add/delete list, reused for
                                                       hero_slides, jobs_table, students_data,
                                                       results_table, scholarships_table
    MessagesManager.jsx                              → read + delete list for contact_messages
    PagesManager.jsx                                   → edit-in-place for the 4 site_pages rows
lib/
  supabaseClient.js                                     → Supabase client (anon key, safe for browser)
  data.js                                                → shared server-side data fetchers
sql/
  schema.sql                                              → tables + RLS policies + seed rows
```

## Admin dashboard menu

Every public page now has a matching section in the Admin Dashboard sidebar,
so all content can be managed without touching code:

| Sidebar item          | Manages                          | Shown on              |
|------------------------|-----------------------------------|-------------------------|
| Site Settings           | `site_settings`                    | Header, hero, ticker      |
| Hero Slides              | `hero_slides`                       | Home page banner            |
| Jobs                      | `jobs_table`                         | Home page + `/jobs`           |
| Students Zone              | `students_data`                       | Home page + `/students-zone`    |
| Results                     | `results_table`                        | `/results`                        |
| Scholarships                  | `scholarships_table`                    | `/scholarships`                     |
| Contact Messages                | `contact_messages` (read/delete only)    | Submissions from `/contact`           |
| Pages (About / Legal)              | `site_pages`                              | `/about-us`, `/privacy-policy`, `/disclaimer`, `/terms-and-conditions` |

## Notes & next steps

- **Images**: `next.config.js` allows any `https` image host so `logo_url`
  and `hero_slides.image_url` can point anywhere (Supabase Storage,
  Cloudinary, etc.). Narrow `remotePatterns` to your actual host(s) before
  going to production.
- **Search page**: `SearchBar` links to `/search?q=...` — add an
  `app/search/page.js` that queries `jobs_table` and `students_data` with
  `ilike` filters on `title` when you're ready to wire it up.
- **WhatsApp number**: `StudentsZone` takes a `whatsappNumber` prop
  (defaults to a placeholder) — pass your real number from `page.js`, or
  add a `whatsapp_number` column to `site_settings` if you want it
  admin-editable too.
- **Contact messages privacy**: the RLS policy on `contact_messages` only
  allows `insert` for the public (anon) role — visitors can submit the
  form but can never read other people's messages. Only an authenticated
  admin session can view/delete them, which is what powers the "Contact
  Messages" tab.
- **Auth**: RLS policies require `auth.role() = 'authenticated'` for
  writes, so the admin dashboard's Supabase Auth session is what protects
  your data — the anon key alone can only read (and, for contact
  messages, only insert).
