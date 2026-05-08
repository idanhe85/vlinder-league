import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_MAILTO!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

// Called by Vercel Cron daily at 13:00 UTC (15:00 Amsterdam).
// Fetches today's matches from the football API, then pushes to users who haven't predicted.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all WC 2026 matches from the football API
  const apiRes = await fetch(
    'https://api.football-data.org/v4/competitions/WC/matches?season=2026',
    { headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY! } },
  );

  if (!apiRes.ok) {
    return NextResponse.json({ error: 'Football API error', status: apiRes.status }, { status: 502 });
  }

  const { matches: allMatches } = await apiRes.json();

  // Filter to matches kicking off today (UTC date)
  const todayUTC = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const todayMatches = (allMatches as Array<{
    id: number;
    utcDate: string;
    homeTeam: { name: string };
    awayTeam: { name: string };
  }>).filter((m) => m.utcDate.slice(0, 10) === todayUTC);

  if (todayMatches.length === 0) {
    return NextResponse.json({ sent: 0, reason: 'no matches today' });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );

  let sent = 0;

  for (const match of todayMatches) {
    const matchId = String(match.id);

    const { data: subs } = await supabase.rpc('subscriptions_missing_prediction', {
      p_match_id: matchId,
    });

    if (!subs || subs.length === 0) continue;

    const payload = JSON.stringify({
      title: '⚽ Prediction reminder',
      body: `${match.homeTeam.name} vs ${match.awayTeam.name} is today — don't forget your prediction!`,
      url: '/match-center',
      tag: `reminder-${matchId}`,
    });

    await Promise.allSettled(
      subs.map((sub: { endpoint: string; p256dh: string; auth: string }) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        ).catch(async (err: { statusCode?: number }) => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
          }
        }),
      ),
    );

    sent += subs.length;
  }

  return NextResponse.json({ sent, matchesToday: todayMatches.length });
}
