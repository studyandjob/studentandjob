import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/requireAdmin';

// Creating a Supabase Auth user with the regular (anon-key) client from
// the browser would sign the *admin's own browser* in as that new user,
// kicking them out of their own session — that's why this has to be a
// server route using the service-role key instead.
export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { name, email, password } = await request.json();
  if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
    return NextResponse.json(
      { error: 'Name, email, and a password of at least 6 characters are required.' },
      { status: 400 }
    );
  }

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true, // no email-verification step for staff logins
  });
  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  const { error: profileError } = await supabaseAdmin.from('staff_users').insert({
    id: created.user.id,
    name: name.trim(),
    email: email.trim(),
  });
  if (profileError) {
    // Roll back the auth user so we don't leave an orphaned login with no
    // staff profile behind if the insert failed (e.g. duplicate somehow).
    await supabaseAdmin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ user: { id: created.user.id, name: name.trim(), email: email.trim() } });
}
