'use client';

import { useEffect, useRef, useState } from 'react';
import { usePredictions } from '@/app/context/PredictionContext';
import { getTeamFlag } from '@/utils/flagMap';

/* ── API types ───────────────────────────────────────────────────────────── */

interface ApiTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string | null;
  crest: string | null;
}

interface ApiMatch {
  id: number;
  utcDate: string;
  status: string;
  matchday: number;
  stage: string;
  group: string | null;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
}

interface InsightsData {
  total: number;
  homeWinPct: number;
  drawPct: number;
  awayWinPct: number;
  topScorelines: { home: number; away: number; count: number; pct: number }[];
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function InsightsPage() {
  const { matchPredictions } = usePredictions();

  const [matches,        setMatches]        = useState<ApiMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [selectedMatch,  setSelectedMatch]  = useState<ApiMatch | null>(null);
  const [selectedMD,     setSelectedMD]     = useState(1);

  const [insights,        setInsights]        = useState<InsightsData | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Keep a ref to matchPredictions so the auto-select effect can read the latest
  // value without adding it as a dependency (avoids re-running on every keystroke).
  const matchPredictionsRef = useRef(matchPredictions);
  useEffect(() => { matchPredictionsRef.current = matchPredictions; }, [matchPredictions]);

  // Load matches. After both matches AND predictions are available, auto-select
  // the first match the user has predicted. Falls back to group[0].
  const didInit = useRef(false);
  useEffect(() => {
    fetch('/api/football/matches')
      .then((r) => r.json())
      .then((d) => {
        const group: ApiMatch[] = (d.matches ?? []).filter(
          (m: ApiMatch) => m.stage === 'GROUP_STAGE',
        );
        setMatches(group);
      })
      .catch(() => {})
      .finally(() => setMatchesLoading(false));
  }, []);

  // Re-run auto-selection once predictions load (they may arrive after matches).
  useEffect(() => {
    if (matches.length === 0) return;
    if (didInit.current) return;
    // Wait until predictions are actually loaded (non-empty), or fall back after matches load
    const hasPredictions = Object.keys(matchPredictions).length > 0;
    const firstPredicted = hasPredictions
      ? matches.find((m) => matchPredictions[String(m.id)])
      : null;
    const defaultMatch = firstPredicted ?? matches[0] ?? null;
    if (defaultMatch) {
      didInit.current = true;
      setSelectedMatch(defaultMatch);
      setSelectedMD(defaultMatch.matchday);
    }
  }, [matches, matchPredictions]);

  // Fetch insights whenever selected match changes
  useEffect(() => {
    if (!selectedMatch) return;
    setInsights(null);
    setInsightsLoading(true);
    fetch(`/api/insights/${selectedMatch.id}`)
      .then((r) => r.json())
      .then(setInsights)
      .catch(() => setInsights(null))
      .finally(() => setInsightsLoading(false));
  }, [selectedMatch?.id]);

  const matchdayMatches = matches.filter((m) => m.matchday === selectedMD);
  const userPrediction  = selectedMatch
    ? matchPredictions[String(selectedMatch.id)]
    : null;

  return (
    <main className="min-h-screen bg-background px-5 py-10 max-w-[80rem] mx-auto">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="font-h1 text-h1 text-primary uppercase tracking-tight">
          Match Insights
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
          Community predictions across Vlinder League.
        </p>
      </div>

      {/* ── Match Picker ─────────────────────────────────────────────── */}
      <div className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-8">
        {/* Matchday tabs */}
        <div className="flex gap-1 bg-surface-container-highest border border-white/10 rounded-xl p-1 w-fit mb-4">
          {[1, 2, 3].map((md) => (
            <button
              key={md}
              type="button"
              onClick={() => setSelectedMD(md)}
              className={[
                'px-4 py-1.5 rounded-lg font-label-caps text-label-caps transition-all duration-150',
                selectedMD === md
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-white/5',
              ].join(' ')}
            >
              MD {md}
            </button>
          ))}
        </div>

        {/* Match cards row */}
        {matchesLoading ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 w-44 flex-shrink-0 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 snap-x">
            {matchdayMatches.map((m) => {
              const isSelected = selectedMatch?.id === m.id;
              const hasPrediction = !!matchPredictions[String(m.id)];
              const date = new Date(m.utcDate).toLocaleDateString('en-GB', {
                month: 'short', day: 'numeric',
              });
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMatch(m)}
                  className={[
                    'flex-shrink-0 snap-start flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border transition-all duration-150 min-w-[130px]',
                    isSelected
                      ? 'bg-primary-container/15 border-primary-container/50 shadow-[0_0_16px_rgba(195,244,0,0.1)]'
                      : 'bg-surface-container-highest/60 border-white/10 hover:border-white/20',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2 w-full justify-center">
                    <TeamBadge team={m.homeTeam} size="sm" />
                    <span className="font-label-caps text-[10px] text-on-surface-variant">VS</span>
                    <TeamBadge team={m.awayTeam} size="sm" />
                  </div>
                  <span className="font-label-caps text-[10px] text-on-surface-variant/60">{date}</span>
                  {hasPrediction && (
                    <span className="material-symbols-outlined text-primary-container text-[12px]">check_circle</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Insights for selected match ───────────────────────────────── */}
      {selectedMatch && (
        <>
          {/* Match hero */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 mb-6">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
              style={{ backgroundImage: 'url(/insights_background.jpg)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-background/95" />

            <div className="relative px-6 py-8 sm:px-10">
              <div className="flex items-center gap-3 mb-5">
                <span className="font-label-caps text-label-caps bg-primary-container text-on-primary-container px-3 py-1 rounded">
                  {(selectedMatch.group ?? selectedMatch.stage).replace('GROUP_', 'Group ')}
                </span>
                <span className="font-label-caps text-label-caps text-on-surface-variant text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                  {new Date(selectedMatch.utcDate).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                  {' · '}
                  {new Date(selectedMatch.utcDate).toLocaleTimeString('en-GB', {
                    hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
                  })} UTC
                </span>
              </div>

              <div className="flex items-center justify-center gap-8 sm:gap-16">
                <TeamHero team={selectedMatch.homeTeam} />
                <span className="font-black text-[2.5rem] italic text-primary-container/60 flex-shrink-0">
                  VS
                </span>
                <TeamHero team={selectedMatch.awayTeam} />
              </div>
            </div>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left col */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Community predictions — 1 X 2 bar */}
              <div className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-secondary text-[20px]">bar_chart</span>
                  <h2 className="font-h3 text-h3 text-primary">Community Predictions</h2>
                  {insights && insights.total > 0 && (
                    <span className="ml-auto font-label-caps text-label-caps text-on-surface-variant/60 bg-surface-container-highest px-2 py-0.5 rounded">
                      {insights.total} {insights.total === 1 ? 'pick' : 'picks'}
                    </span>
                  )}
                </div>

                {insightsLoading ? (
                  <div className="space-y-3">
                    <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
                    <div className="h-6 bg-white/5 rounded animate-pulse" />
                  </div>
                ) : insights && insights.total > 0 ? (
                  <OneXTwoBar
                    homeTeam={selectedMatch.homeTeam}
                    awayTeam={selectedMatch.awayTeam}
                    homePct={insights.homeWinPct}
                    drawPct={insights.drawPct}
                    awayPct={insights.awayWinPct}
                  />
                ) : (
                  <EmptyState
                    icon="how_to_vote"
                    message="No predictions yet for this match. Be the first!"
                  />
                )}
              </div>

              {/* Top scorelines */}
              <div className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <span className="material-symbols-outlined text-secondary text-[20px]">sports_score</span>
                  <h2 className="font-h3 text-h3 text-primary">Top Scorelines</h2>
                </div>

                {insightsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : insights && insights.topScorelines.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {insights.topScorelines.map((s, i) => (
                      <div
                        key={`${s.home}-${s.away}`}
                        className={[
                          'border rounded-xl p-4 text-center',
                          i === 0
                            ? 'bg-primary-container/10 border-primary-container/30'
                            : 'bg-surface-container-highest border-white/5',
                        ].join(' ')}
                      >
                        <p className={`font-h2 text-h2 tracking-widest ${i === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {s.home}–{s.away}
                        </p>
                        <p className={`font-label-caps text-label-caps mt-1 ${i === 0 ? 'text-primary-container' : 'text-on-surface-variant/60'}`}>
                          {s.pct}% picked
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon="sports_score" message="No scoreline data yet." />
                )}
              </div>
            </div>

            {/* Right col */}
            <div className="flex flex-col gap-6">

              {/* Your prediction */}
              <div className="bg-surface-container/60 backdrop-blur-xl border border-t-2 border-white/10 border-t-primary-container rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <span className="material-symbols-outlined text-primary-container text-[20px]">edit_note</span>
                  <h2 className="font-h3 text-h3 text-primary">Your Prediction</h2>
                </div>

                {userPrediction ? (
                  <div className="flex flex-col items-center gap-4 py-2">
                    <span className="font-label-caps text-label-caps text-on-surface-variant">YOUR PICK</span>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-20 bg-surface-container-highest border border-white/10 rounded-lg flex items-center justify-center">
                        <span className="font-black text-[2.5rem] text-primary leading-none">{userPrediction.home}</span>
                      </div>
                      <span className="font-h3 text-h3 text-on-surface-variant">:</span>
                      <div className="w-16 h-20 bg-surface-container-highest border border-white/10 rounded-lg flex items-center justify-center">
                        <span className="font-black text-[2.5rem] text-primary leading-none">{userPrediction.away}</span>
                      </div>
                    </div>
                    <span className="font-label-caps text-label-caps text-primary-container">
                      +{userPrediction.pointsEarned} pts locked
                    </span>
                  </div>
                ) : (
                  <EmptyState
                    icon="lock_open"
                    message="You haven't predicted this match yet."
                  />
                )}
              </div>

              {/* League participation */}
              <div className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-secondary text-[20px]">groups</span>
                  <h2 className="font-h3 text-h3 text-primary">League Activity</h2>
                </div>

                {insightsLoading ? (
                  <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
                ) : insights ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-body-md text-on-surface-variant text-sm">Members predicted</span>
                      <span className="font-h3 text-h3 text-primary tabular-nums">{insights.total}</span>
                    </div>
                    {insights.total > 0 && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-body-md text-on-surface-variant text-sm">Most backed</span>
                          <span className="font-label-caps text-label-caps text-primary-container">
                            {insights.homeWinPct >= insights.drawPct && insights.homeWinPct >= insights.awayWinPct
                              ? `${selectedMatch.homeTeam.tla ?? 'Home'} Win`
                              : insights.awayWinPct >= insights.drawPct
                              ? `${selectedMatch.awayTeam.tla ?? 'Away'} Win`
                              : 'Draw'}
                          </span>
                        </div>
                        {insights.topScorelines[0] && (
                          <div className="flex items-center justify-between">
                            <span className="font-body-md text-on-surface-variant text-sm">Top scoreline</span>
                            <span className="font-label-caps text-label-caps text-primary-container">
                              {insights.topScorelines[0].home}–{insights.topScorelines[0].away}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function TeamBadge({ team, size }: { team: ApiTeam; size: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-6 h-6' : 'w-10 h-10';
  const flag = getTeamFlag(team.name, team.crest);
  return flag ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={flag} alt={team.name} className={`${dim} rounded-full object-cover`} />
  ) : (
    <span className="font-label-caps text-[10px] text-on-surface-variant">{team.tla ?? '?'}</span>
  );
}

function TeamHero({ team }: { team: ApiTeam }) {
  const flag = getTeamFlag(team.name, team.crest);
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/20 bg-surface-container-highest flex items-center justify-center overflow-hidden">
        {flag ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={flag} alt={team.name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-label-caps text-sm font-bold text-on-surface-variant">{team.tla ?? '?'}</span>
        )}
      </div>
      <p className="font-h3 text-h3 text-primary">{team.tla ?? team.name}</p>
    </div>
  );
}

function OneXTwoBar({
  homeTeam, awayTeam, homePct, drawPct, awayPct,
}: {
  homeTeam: ApiTeam; awayTeam: ApiTeam;
  homePct: number; drawPct: number; awayPct: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Team labels */}
      <div className="flex justify-between items-center text-xs text-on-surface-variant font-label-caps">
        <span className="flex items-center gap-1.5">
          {getTeamFlag(homeTeam.name, homeTeam.crest) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={getTeamFlag(homeTeam.name, homeTeam.crest)!} alt="" className="w-4 h-4 rounded-full object-cover" />
          )}
          {homeTeam.tla ?? homeTeam.name}
        </span>
        <span>Draw</span>
        <span className="flex items-center gap-1.5">
          {awayTeam.tla ?? awayTeam.name}
          {getTeamFlag(awayTeam.name, awayTeam.crest) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={getTeamFlag(awayTeam.name, awayTeam.crest)!} alt="" className="w-4 h-4 rounded-full object-cover" />
          )}
        </span>
      </div>

      {/* Unified 3-segment bar */}
      <div className="flex h-12 rounded-xl overflow-hidden gap-0.5">
        {homePct > 0 && (
          <div
            className="flex items-center justify-center transition-all duration-700"
            style={{ width: `${homePct}%`, background: 'linear-gradient(135deg, #1a5c2e, #c3f400)' }}
          >
            <span className="font-black text-base text-background tabular-nums drop-shadow">{homePct}%</span>
          </div>
        )}
        {drawPct > 0 && (
          <div
            className="flex items-center justify-center transition-all duration-700"
            style={{ width: `${drawPct}%`, background: 'linear-gradient(135deg, #2a2d32, #6b7280)' }}
          >
            <span className="font-black text-base text-white tabular-nums drop-shadow">{drawPct}%</span>
          </div>
        )}
        {awayPct > 0 && (
          <div
            className="flex items-center justify-center transition-all duration-700"
            style={{ width: `${awayPct}%`, background: 'linear-gradient(135deg, #1e3a5f, #b3c5ff)' }}
          >
            <span className="font-black text-base text-background tabular-nums drop-shadow">{awayPct}%</span>
          </div>
        )}
      </div>

      {/* Labels under bar */}
      <div className="flex justify-between text-[11px] text-on-surface-variant font-label-caps uppercase tracking-wider">
        <span style={{ width: `${homePct}%`, textAlign: 'center' }}>1</span>
        <span style={{ width: `${drawPct}%`, textAlign: 'center' }}>X</span>
        <span style={{ width: `${awayPct}%`, textAlign: 'center' }}>2</span>
      </div>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <span className="material-symbols-outlined text-[32px] text-on-surface-variant/30">{icon}</span>
      <p className="font-body-md text-sm text-on-surface-variant/60">{message}</p>
    </div>
  );
}
