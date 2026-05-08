import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// POST /api/admin/reset-all
// Truncates match_predictions, prop_predictions, and resets leaderboard points to 0.
// Admin-only. Intended for pre-tournament test resets.
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();

  const anonClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { data: { user } } = await anonClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await anonClient
    .from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );

  const { error: e1 } = await supabase.from('match_predictions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (e1) return NextResponse.json({ error: `match_predictions: ${e1.message}` }, { status: 500 });

  const { error: e2 } = await supabase.from('prop_predictions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (e2) return NextResponse.json({ error: `prop_predictions: ${e2.message}` }, { status: 500 });

  // leaderboard is a view — deleting predictions automatically zeroes everyone's score

  return NextResponse.json({ ok: true });
}
