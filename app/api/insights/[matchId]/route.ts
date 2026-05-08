import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ matchId: string }> },
) {
  const { matchId } = await params;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );

  const { data, error } = await supabase
    .from('match_predictions')
    .select('home_score, away_score')
    .eq('match_id', matchId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const predictions = data ?? [];
  const total = predictions.length;

  if (total === 0) {
    return NextResponse.json({ total: 0, homeWinPct: 0, drawPct: 0, awayWinPct: 0, topScorelines: [] });
  }

  let homeWins = 0, draws = 0, awayWins = 0;
  const scorelineMap: Record<string, number> = {};

  for (const { home_score: h, away_score: a } of predictions) {
    if (h > a)      homeWins++;
    else if (h < a) awayWins++;
    else            draws++;

    const key = `${h}-${a}`;
    scorelineMap[key] = (scorelineMap[key] ?? 0) + 1;
  }

  const topScorelines = Object.entries(scorelineMap)
    .map(([score, count]) => {
      const [home, away] = score.split('-').map(Number);
      return { home, away, count, pct: Math.round((count / total) * 100) };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return NextResponse.json({
    total,
    homeWinPct:  Math.round((homeWins  / total) * 100),
    drawPct:     Math.round((draws     / total) * 100),
    awayWinPct:  Math.round((awayWins  / total) * 100),
    topScorelines,
  });
}
