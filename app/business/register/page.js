import { redirect } from 'next/navigation';

// There is no separate registration any more — one email step does both.
// Old links to /business/register land on the login page.
export default function Page() {
  redirect('/business/login?next=/business/new');
}
