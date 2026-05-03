'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePredictions } from '@/app/context/PredictionContext';
import { MatchCardSkeleton } from '@/app/components/MatchCardSkeleton';

/* ── API types ───────────────────────────────────────────────────────────── */

interface ApiTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

interface ApiMatch {
  id: number;
  utcDate: string;
  status: 'TIMED' | 'SCHEDULED' | 'IN_PLAY' | 'FINISHED' | 'POSTPONED';
  matchday: number;
  stage: string;
  group: string | null;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
  score: {
    winner: string | null;
    fullTime: { home: number | null; away: number | null };
  };
}

interface StandingRow {
  position: number;
  team: ApiTeam;
  playedGames: number;
  points: number;
  goalDifference: number;
}

interface ApiStandingGroup {
  stage: string;
  type: string;
  group: string;
  table: StandingRow[];
}

/* ── Main page ───────────────────────────────────────────────────────────── */

export default function MatchCenterPage() {
  const [activeView, setActiveView] = useState<'groups' | 'knockout'>('groups');
  const [selectedMatchday, setSelectedMatchday] = useState(1);

  const [standings, setStandings] = useState<ApiStandingGroup[]>([]);
  const [matches,   setMatches]   = useState<ApiMatch[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [standRes, matchRes] = await Promise.all([
          fetch('/api/football/standings'),
          fetch('/api/football/matches'),
        ]);
        // standings may 404 before tournament starts — that's fine
        const matchData = await matchRes.json();
        setMatches(matchData.matches ?? []);
        if (standRes.ok) {
          const standData = await standRes.json();
          setStandings(standData.standings ?? []);
        }
      } catch {
        setError('Could not load live data. Please refresh.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const groupStandings = standings.filter((s) => s.type === 'TOTAL');

  // When standings aren't available yet, derive groups from match fixtures
  const groupsFromMatches = groupStandings.length === 0
    ? buildGroupsFromMatches(matches.filter((m) => m.stage === 'GROUP_STAGE'))
    : null;
  const groupMatches   = matches.filter((m) => m.stage === 'GROUP_STAGE' && m.matchday === selectedMatchday);
  const knockoutMatches = matches.filter((m) => m.stage !== 'GROUP_STAGE');

  const knockoutStages = [
    { key: 'LAST_32',       label: 'Round of 32' },
    { key: 'LAST_16',       label: 'Round of 16' },
    { key: 'QUARTER_FINALS',label: 'Quarter Finals' },
    { key: 'SEMI_FINALS',   label: 'Semi Finals' },
    { key: 'THIRD_PLACE',   label: 'Third Place' },
    { key: 'FINAL',         label: 'Final' },
  ];

  return (
    <main className="min-h-screen bg-background px-5 py-10 max-w-[80rem] mx-auto">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="font-h1 text-h1 text-primary uppercase tracking-tight">
          Match Center
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
          Live group standings and match predictions for World Cup 2026.
        </p>
      </div>

      {/* ── View Toggle ──────────────────────────────────────────────── */}
      <div className="inline-flex items-center bg-surface-container-highest border border-white/10 rounded-xl p-1 mb-8">
        {(['groups', 'knockout'] as const).map((view) => (
          <button
            key={view}
            type="button"
            onClick={() => setActiveView(view)}
            className={[
              'px-5 py-2 rounded-lg font-label-caps text-label-caps transition-all duration-200 capitalize',
              activeView === view
                ? 'bg-primary-container text-on-primary-container shadow'
                : 'text-on-surface-variant hover:text-primary hover:bg-white/5',
            ].join(' ')}
          >
            {view === 'groups' ? 'Group Stage' : 'Knockout Phase'}
          </button>
        ))}
      </div>

      {/* ── Error ────────────────────────────────────────────────────── */}
      {error && (
        <div className="mb-6 px-4 py-3 bg-error-container/10 border border-error/20 rounded-xl text-error text-sm">
          {error}
        </div>
      )}

      {/* ── Loading skeleton ─────────────────────────────────────────── */}
      {loading && (
        <>
          {/* Group card placeholders */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded bg-white/10 animate-pulse" />
              <div className="w-32 h-5 rounded-full bg-white/10 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 bg-surface-container/40 rounded-xl animate-pulse" />
              ))}
            </div>
          </section>

          {/* Fixture card skeletons */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-5 h-5 rounded bg-white/10 animate-pulse" />
              <div className="w-24 h-5 rounded-full bg-white/10 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <MatchCardSkeleton key={i} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* ── Group Stage View ─────────────────────────────────────────── */}
      {!loading && activeView === 'groups' && (
        <>
          {/* Group standings */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary-container text-[20px]">grid_view</span>
              <h2 className="font-h3 text-h3 text-primary">Groups</h2>
              {groupsFromMatches && (
                <span className="font-label-caps text-label-caps text-on-surface-variant/60 bg-surface-container-highest px-2 py-0.5 rounded ml-1">
                  Pre-tournament draw
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {groupStandings.length > 0
                ? groupStandings.map((g) => <GroupCard key={g.group} group={g} />)
                : groupsFromMatches?.map((g) => <GroupPreviewCard key={g.name} group={g} />)
              }
            </div>
          </section>

          {/* Matchday picker */}
          <section>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-[20px]">sports_soccer</span>
                <h2 className="font-h3 text-h3 text-primary">Fixtures</h2>
              </div>
              <div className="flex gap-1 bg-surface-container-highest border border-white/10 rounded-xl p-1">
                {[1, 2, 3].map((md) => (
                  <button
                    key={md}
                    type="button"
                    onClick={() => setSelectedMatchday(md)}
                    className={[
                      'px-4 py-1.5 rounded-lg font-label-caps text-label-caps transition-all duration-150',
                      selectedMatchday === md
                        ? 'bg-primary-container text-on-primary-container'
                        : 'text-on-surface-variant hover:bg-white/5',
                    ].join(' ')}
                  >
                    MD {md}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-on-surface-variant text-sm mb-5">
              +5 pts per prediction · +3 pts correct outcome · +10 pts exact score
            </p>

            {groupMatches.length === 0 ? (
              <p className="text-on-surface-variant/60 text-sm">No fixtures found for this matchday.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupMatches.map((m) => (
                  <FixtureCard key={m.id} match={m} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* ── Knockout View ────────────────────────────────────────────── */}
      {!loading && activeView === 'knockout' && (
        <section>
          {knockoutStages.map(({ key, label }) => {
            const stageMatches = knockoutMatches.filter((m) => m.stage === key);
            if (stageMatches.length === 0) return null;
            return (
              <div key={key} className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary-container text-[20px]">account_tree</span>
                  <h2 className="font-h3 text-h3 text-primary">{label}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stageMatches.map((m) => (
                    <FixtureCard key={m.id} match={m} />
                  ))}
                </div>
              </div>
            );
          })}
          {knockoutMatches.length === 0 && (
            <div className="bg-surface-container/40 border border-white/10 rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40 block mb-3">
                account_tree
              </span>
              <p className="text-on-surface-variant text-sm">
                Knockout fixtures will be available once the group stage draw is confirmed.
              </p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

/* ── GroupCard ───────────────────────────────────────────────────────────── */

function GroupCard({ group }: { group: ApiStandingGroup }) {
  const label = group.group.replace('GROUP_', 'Group ');
  return (
    <div className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <span className="font-h3 text-sm font-bold text-primary-container">{label}</span>
        <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded">
          {group.table[0]?.playedGames === 0 ? 'UPCOMING' : `${group.table[0]?.playedGames} PLAYED`}
        </span>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left px-4 py-2 font-label-caps text-label-caps text-on-surface-variant w-6">#</th>
            <th className="text-left px-4 py-2 font-label-caps text-label-caps text-on-surface-variant">Team</th>
            <th className="text-right px-2 py-2 font-label-caps text-label-caps text-on-surface-variant">P</th>
            <th className="text-right px-2 py-2 font-label-caps text-label-caps text-on-surface-variant">GD</th>
            <th className="text-right px-4 py-2 font-label-caps text-label-caps text-on-surface-variant">Pts</th>
          </tr>
        </thead>
        <tbody>
          {group.table.map((row, idx) => (
            <tr
              key={row.team.id}
              className={[
                'border-b border-white/5 last:border-0',
                idx < 2 ? 'bg-primary-container/5' : 'opacity-60',
              ].join(' ')}
            >
              <td className="px-4 py-2.5 font-label-caps text-label-caps text-on-surface-variant">{row.position}</td>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  {row.team.crest ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={row.team.crest} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
                  ) : (
                    <span className="w-3 h-3 rounded-sm bg-white/20 flex-shrink-0" />
                  )}
                  <span className="font-body-md text-on-surface">{row.team.tla}</span>
                </div>
              </td>
              <td className="text-right px-2 py-2.5 text-on-surface-variant">{row.playedGames}</td>
              <td className="text-right px-2 py-2.5 text-on-surface-variant">
                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
              </td>
              <td className="text-right px-4 py-2.5 font-bold text-primary">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── FixtureCard ─────────────────────────────────────────────────────────── */

function FixtureCard({ match }: { match: ApiMatch }) {
  const { matchPredictions, saveMatchPrediction } = usePredictions();
  const prediction = matchPredictions[String(match.id)];

  const [homeInput, setHomeInput] = useState<number | ''>(prediction?.home ?? '');
  const [awayInput, setAwayInput] = useState<number | ''>(prediction?.away ?? '');
  const [editing,   setEditing]   = useState(!prediction);
  const [justSaved, setJustSaved] = useState(false);

  const isUpcoming = match.status === 'TIMED' || match.status === 'SCHEDULED';
  const isFinished = match.status === 'FINISHED';
  const canSave    = homeInput !== '' && awayInput !== '';

  const date = new Date(match.utcDate);
  const dateStr = date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC';

  const groupLabel = match.group ? match.group.replace('GROUP_', 'Group ') : match.stage.replace(/_/g, ' ');

  function handleSave() {
    if (!canSave) return;
    saveMatchPrediction(
      String(match.id),
      `${match.homeTeam.tla} vs ${match.awayTeam.tla}`,
      Number(homeInput),
      Number(awayInput),
    );
    setEditing(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1000);
  }

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(195, 244, 0, 0.12)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={[
        'relative bg-surface-container/60 backdrop-blur-xl border rounded-xl overflow-hidden',
        'border-l-4',
        prediction
          ? 'border-primary-container/60 border-l-primary-container'
          : 'border-white/10 border-l-white/20',
      ].join(' ')}
    >
      {/* ── Save success pulse overlay ──────────────────────────── */}
      <AnimatePresence>
        {justSaved && (
          <motion.div
            key="save-pulse"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute inset-0 rounded-xl pointer-events-none bg-primary-container/20 ring-2 ring-inset ring-primary-container/60"
          />
        )}
      </AnimatePresence>

      <div className="p-4">
        {/* Date + group */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-on-surface-variant text-sm">
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            <span>{dateStr} · {timeStr}</span>
          </div>
          <span className="font-label-caps text-label-caps bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant">
            {groupLabel}
          </span>
        </div>

        {/* Teams row */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <TeamBlock
            team={match.homeTeam}
            score={isFinished ? match.score.fullTime.home : null}
            align="left"
          />
          <span className="text-on-surface-variant font-label-caps text-label-caps flex-shrink-0">VS</span>
          <TeamBlock
            team={match.awayTeam}
            score={isFinished ? match.score.fullTime.away : null}
            align="right"
          />
        </div>

        {/* Prediction zone */}
        {isUpcoming && (
          <div className="border-t border-white/5 pt-4 mt-2">
            {prediction && !editing ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container text-[18px]">check_circle</span>
                  <span className="font-body-md text-on-surface">
                    Your pick:&nbsp;
                    <span className="text-primary font-semibold tabular-nums">
                      {prediction.home} – {prediction.away}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-label-caps text-label-caps text-primary-container">
                    +{prediction.pointsEarned} pts
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="font-label-caps text-label-caps text-secondary hover:text-secondary-fixed transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="font-label-caps text-label-caps text-on-surface-variant text-sm flex-1 text-right">
                  {match.homeTeam.tla}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number" min={0} max={20}
                    value={homeInput}
                    onChange={(e) => setHomeInput(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-14 h-12 bg-surface-container-highest border border-white/20 rounded-lg text-center font-h3 text-h3 text-primary focus:outline-none focus:border-primary-container focus:shadow-[0_0_0_2px_rgba(195,244,0,0.25)] transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    aria-label={`${match.homeTeam.tla} score`}
                  />
                  <span className="font-h3 text-h3 text-on-surface-variant">:</span>
                  <input
                    type="number" min={0} max={20}
                    value={awayInput}
                    onChange={(e) => setAwayInput(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-14 h-12 bg-surface-container-highest border border-white/20 rounded-lg text-center font-h3 text-h3 text-primary focus:outline-none focus:border-primary-container focus:shadow-[0_0_0_2px_rgba(195,244,0,0.25)] transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    aria-label={`${match.awayTeam.tla} score`}
                  />
                </div>
                <span className="font-label-caps text-label-caps text-on-surface-variant text-sm flex-1">
                  {match.awayTeam.tla}
                </span>
                <motion.button
                  type="button"
                  onClick={handleSave}
                  disabled={!canSave}
                  whileTap={canSave ? { scale: 0.95 } : undefined}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className={[
                    'px-4 py-2 rounded-lg font-label-caps text-label-caps transition-all duration-150',
                    canSave
                      ? 'bg-primary-container text-on-primary-container hover:bg-primary-fixed-dim'
                      : 'bg-surface-container-highest text-on-surface-variant/30 cursor-not-allowed',
                  ].join(' ')}
                >
                  Save
                </motion.button>
              </div>
            )}
          </div>
        )}

        {isFinished && (
          <div className="border-t border-white/5 pt-3 mt-1">
            {prediction ? (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary-container">check_circle</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant">
                  Your pick: {prediction.home}–{prediction.away}
                </span>
                {prediction.pointsEarned > 5 && (
                  <span className="font-label-caps text-label-caps text-primary-container ml-auto">
                    +{prediction.pointsEarned} pts
                  </span>
                )}
              </div>
            ) : (
              <span className="font-label-caps text-label-caps text-on-surface-variant/40">No prediction submitted</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── buildGroupsFromMatches ──────────────────────────────────────────────── */

interface GroupPreview { name: string; teams: ApiTeam[]; }

function buildGroupsFromMatches(groupMatches: ApiMatch[]): GroupPreview[] {
  const map = new Map<string, Map<number, ApiTeam>>();
  for (const m of groupMatches) {
    if (!m.group) continue;
    if (!map.has(m.group)) map.set(m.group, new Map());
    const g = map.get(m.group)!;
    g.set(m.homeTeam.id, m.homeTeam);
    g.set(m.awayTeam.id, m.awayTeam);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([groupKey, teams]) => ({
      name: groupKey.replace('GROUP_', 'Group '),
      teams: Array.from(teams.values()),
    }));
}

/* ── GroupPreviewCard (pre-tournament, no standings yet) ─────────────────── */

function GroupPreviewCard({ group }: { group: GroupPreview }) {
  return (
    <div className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <span className="font-h3 text-sm font-bold text-primary-container">{group.name}</span>
        <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded">
          UPCOMING
        </span>
      </div>
      <div className="divide-y divide-white/5">
        {group.teams.map((team) => (
          <div key={team.id} className="flex items-center gap-3 px-4 py-2.5">
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
              {team.crest
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={team.crest} alt={team.name} className="w-6 h-6 object-contain" />
                : <span className="font-label-caps text-[10px] text-on-surface-variant">{team.tla}</span>
              }
            </div>
            <span className="font-body-md text-on-surface">{team.name}</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant/50 ml-auto">{team.tla}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── TeamBlock ───────────────────────────────────────────────────────────── */

function TeamBlock({
  team, score, align,
}: { team: ApiTeam; score: number | null; align: 'left' | 'right' }) {
  return (
    <div className={`flex items-center gap-3 flex-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border border-white/20 bg-surface-container-highest overflow-hidden">
        {team.crest ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={team.crest} alt={team.name} className="w-7 h-7 object-contain" />
        ) : (
          <span className="font-label-caps text-[11px] font-bold text-on-surface-variant">
            {team.tla.slice(0, 2)}
          </span>
        )}
      </div>
      <div className={align === 'right' ? 'text-right' : ''}>
        <p className="font-body-md font-semibold text-primary">{team.tla}</p>
        {score !== null ? (
          <p className="font-h3 text-h3 text-primary-container leading-none">{score}</p>
        ) : (
          <p className="font-h3 text-h3 text-on-surface-variant/30 leading-none">—</p>
        )}
      </div>
    </div>
  );
}
