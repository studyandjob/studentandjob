import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Reads the "Authorization: Bearer <access_token>" header, resolves it to
// a user via the service-role client (bypasses RLS so this always works
// regardless of policy state), then checks admin_users directly. Staff
// accounts are never in admin_users, so this correctly rejects them even
// though they're logged in — only the site owner's admin login passes.
//
// Returns { userId } on success, or { error, status } on failure — callers
// should check `error` first.
export async function requireAdmin(request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) {
    return { error: 'Missing Authorization header.', status: 401 };
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) {
    return { error: 'Invalid or expired session.', status: 401 };
  }

  const { data: adminRow, error: adminError } = await supabaseAdmin
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userData.user.id)
    .maybeSingle();
  if (adminError) {
    return { error: adminError.message, status: 500 };
  }
  if (!adminRow) {
    return { error: 'Only the site admin can manage staff accounts.', status: 403 };
  }

  return { userId: userData.user.id };
}
