import { NextResponse } from 'next/server';

const BASE = 'https://api.football-data.org/v4';
const KEY  = process.env.FOOTBALL_DATA_API_KEY!;

export async function GET() {
  const res = await fetch(`${BASE}/competitions/WC/standings?season=2026`, {
    headers: { 'X-Auth-Token': KEY },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch standings' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
