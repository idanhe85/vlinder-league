import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const DOMAIN = '@vlinder.league';

export async function POST(req: NextRequest) {
  const { username, password, display_name } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required.' }, { status: 400 });
  }

  const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (clean.length < 2) {
    return NextResponse.json({ error: 'Username must be at least 2 characters.' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Check username not already taken
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', clean)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'Username already taken.' }, { status: 409 });
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: clean + DOMAIN,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message ?? 'Failed to create user.' }, { status: 500 });
  }

  // Upsert profile
  const { error: profileError } = await supabase.from('profiles').upsert({
    id:           authData.user.id,
    username:     clean,
    display_name: display_name?.trim() || null,
  });

  if (profileError) {
    // Clean up auth user if profile failed
    await supabase.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: 'Failed to create profile.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
