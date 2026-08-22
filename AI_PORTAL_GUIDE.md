# AI-Powered Job & Education Portal — Add-on Guide

This adds three things on top of your existing site: a richer **Add Job**
form, an **AI VIP member portal** for candidates, and **admin billing
management**. Nothing existing was removed — public pages, the current
admin login, and all existing tables still work exactly as before.

## 1. Run the new SQL

In Supabase → SQL Editor, run **`sql/schema_v2_ai_portal.sql`** (after your
original `sql/schema.sql`, which you presumably already ran). It:

- Adds an `admin_users` table + `is_admin()` function, and **tightens every
  existing admin-only policy** to check it instead of "any logged-in user".
  This matters because candidates will now log in too (Supabase Auth is
  shared) — without this patch, a candidate account could edit your site
  settings.
- Extends `jobs_table` with sector, job type, category, conditional
  manual-application fields, and the `education_required` /
  `skills_required` arrays the matching engine reads.
- Creates `candidate_profiles` (VIP profile builder / CV data) and
  `member_requests` (billing).
- Adds `sync_expired_members()` — flips `active` memberships past their
  `end_date` to `expired`. Called automatically by the admin dashboard
  every time the "Portal Requests" tab loads; a commented `pg_cron` line
  is included if you want it to also run daily server-side.
- Creates a public `vip_uploads` storage bucket for CV photos and payment
  screenshots.

**After running it**, register your admin account so it keeps its
permissions:
```sql
insert into admin_users (user_id)
values ('paste-your-admin-users-uid-here'); -- Authentication → Users
```

## 2. What was added, file by file

| File | Purpose |
|---|---|
| `lib/matching.js` | Shared sectors/education/skills vocabulary + `scoreJobMatch()` / `getMatchingJobs()` — the AI matching logic |
| `components/shared/TagSelect.jsx` | Multi-select dropdown+custom tag input, used by both the Add Job form and the candidate profile |
| `components/admin/JobForm.jsx` | The full Add/Edit Job form (sector, type, conditional manual fields, education/skills tags) |
| `components/admin/JobsManager.jsx` | Jobs list + wraps JobForm, replacing the old simple job list in the admin dashboard |
| `components/admin/MembersManager.jsx` | "Admin Portal Requests" — New/Active/Expired tabs, member cards, approve/reject/renew, runs billing auto-expiry on load |
| `components/vip/*` | The whole candidate-facing VIP portal (auth, profile builder, CV, job matching, membership, extra services) |
| `app/vip/page.js` | Entry point — `yoursite.com/vip` |

Sidebar and `app/admin/page.js` were updated to add the **Portal Requests**
menu item and swap the Jobs tab over to the new form.

## 3. How the AI job matching actually works

It's a transparent, explainable scoring function (not a black box), in
`lib/matching.js`:

- **Education (50%)** — does the candidate hold any of the job's required
  education levels? If the job doesn't specify any, this is treated as
  satisfied.
- **Skills (40%)** — the proportion of the job's required skills the
  candidate also lists.
- **Sector preference (10%)** — bonus if the candidate's preferred sector
  matches the job's sector.

Both the Add Job form and the candidate Profile Builder pull their
Education/Skills options from the **same list** in `lib/matching.js` — that
shared vocabulary is what makes the matching meaningful. Free-text custom
tags are still allowed on both sides via `TagSelect`, but only shared,
predefined tags will actually match.

`JobMatches.jsx` scores every open job against the logged-in candidate,
shows a **% Match** badge on each card, and can filter to "matches only".

## 4. Billing / membership flow

1. Candidate signs up at `/vip`, fills their Profile.
2. On the **Membership** tab they pick a plan, upload a payment
   screenshot, and submit — this inserts a `member_requests` row with
   `status = 'pending'`. RLS lets a candidate insert/read only their own
   row; they cannot set themselves to `active`.
3. Admin sees it under **Portal Requests → New Requests**, reviews the
   payment proof, and clicks **Approve & Activate** — this sets
   `status = 'active'` and computes `end_date` from the plan length.
4. Every time the admin opens **Portal Requests**, `sync_expired_members()`
   runs first, so anything whose `end_date` has passed is already moved to
   **Expired Members** before the cards render.

## 5. Local setup

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase URL + anon key
npm run dev
```

Visit `/admin` for the dashboard and `/vip` for the candidate portal.

## 6. Notes / things you may want to adjust

- **Membership plan prices** are placeholders in
  `components/vip/MembershipCard.jsx` (`PLANS` array) — change to your
  real pricing.
- **Extra Services** (`components/vip/ExtraServices.jsx`) are sample
  services with a hardcoded WhatsApp number — edit the list and swap in
  your real number.
- The match threshold ("only show jobs ≥30%") is adjustable — see
  `getMatchingJobs(candidate, jobs, minScore)` in `lib/matching.js`.
- If you want the VIP job listing gated behind an active membership
  (rather than open to any signed-up candidate), add a check for
  `request?.status === 'active'` around `<JobMatches />` in
  `VipDashboard.jsx`.
