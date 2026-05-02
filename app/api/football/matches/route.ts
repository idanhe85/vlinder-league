import { NextRequest, NextResponse } from 'next/server';

const BASE = 'https://api.football-data.org/v4';
const KEY  = process.env.FOOTBALL_DATA_API_KEY!;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const matchday = searchParams.get('matchday');
  const stage    = searchParams.get('stage');

  const params = new URLSearchParams({ season: '2026' });
  if (matchday) params.set('matchday', matchday);
  if (stage)    params.set('stage',    stage);

  const res = await fetch(`${BASE}/competitions/WC/matches?${params}`, {
    headers: { 'X-Auth-Token': KEY },
    next: { revalidate: 60 }, // cache 60 s
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
