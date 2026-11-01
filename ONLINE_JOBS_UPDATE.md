# Online Jobs — update notes

## Deploy karne ke 4 steps
1. **Supabase → SQL Editor** mein `sql/add_pages_and_ads.sql` ek baar run karein (naye columns banata hai).
2. Code Vercel par push/deploy karein (ye project replace kar dein).
3. **Admin → Site Settings** mein Website Name `Online Jobs` kar dein (database mein abhi purana naam hoga).
4. **Admin → Pages & Ads** kholein: pages ke tick, ad gate aur ad codes yahin se set hote hain.

## Kya badla
- Menu: sirf **Home, Jobs, Contact Us** (baqi pages sirf tab dikhte hain jab Pages & Ads mein tick ho).
- Home: jobs-only (heading, search, aaj ki important jobs, latest jobs, WhatsApp channel button).
- Band page par: asal 307 redirect `/jobs` par (middleware.js) + sitemap/menu/footer se ghayab.
- Ads: View Details par ad page (`/jobs/[id]/ad`), job page mein top/middle/bottom slots, home/jobs list slot, site-wide script, `/ads.txt`.
- Staff login (`/user`) aur Staff/Task Assignment pehle jaisa.
- Purane sections ka code aur database delete nahi hua — tick karte hi wapas aa jate hain.

## Ad codes kaise lagayein
- Site-wide script (jaise AdSense library) sirf **"Site-wide ad script"** box mein, ek baar.
- Slot boxes mein sirf us slot ka code (AdSense mein `<ins ...>` + `push` wali script).
- Ad gate tab chalta hai jab "Turn on" tick ho **aur** gate ka code box khali na ho.
