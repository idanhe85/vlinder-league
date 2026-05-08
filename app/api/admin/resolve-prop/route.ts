import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  // Use anon key + session cookies only for auth verification
  const anonClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  // Verify authenticated + admin
  const { data: { user } } = await anonClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await anonClient.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Use service role key for privileged writes (bypasses RLS)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );

  const { prop_id, status } = await request.json();
  if (!prop_id || !['won', 'lost'].includes(status)) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }

  // Get prop points value
  const { data: prop } = await supabase.from('props').select('points').eq('id', prop_id).single();
  if (!prop) return NextResponse.json({ error: 'Prop not found' }, { status: 404 });

  // Update prop status
  await supabase.from('props').update({ status }).eq('id', prop_id);

  // Score all predictions for this prop
  const pointsToAward = status === 'won' ? prop.points : 0;
  const { data: updated } = await supabase
    .from('prop_predictions')
    .update({ points_earned: pointsToAward })
    .eq('prop_id', prop_id)
    .select('id');

  return NextResponse.json({ updated: updated?.length ?? 0 });
}
