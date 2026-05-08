import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();

  // Use anon key + session cookies only for auth verification
  const anonClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    },
  );

  // Verify authenticated
  const { data: { user } } = await anonClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify admin
  const { data: profile } = await anonClient
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Use service role key for privileged writes (bypasses RLS)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );

  // Parse body
  const { match_id, home_score, away_score } = await request.json();

  if (!match_id || home_score == null || away_score == null) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Call the scoring function
  const { data, error } = await supabase.rpc('score_match', {
    p_match_id:   String(match_id),
    p_home_score: Number(home_score),
    p_away_score: Number(away_score),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ updated: data });
}
