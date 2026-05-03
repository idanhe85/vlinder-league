'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePredictions } from '@/app/context/PredictionContext';
import { NumberTicker } from '@/app/components/NumberTicker';

export default function LeaderboardPage() {
  const { totalScore, matchPredictions } = usePredictions();

  const BASE_RANK = 12; // "You" rank at 890 pts
  const BASE_SCORE = 890;

  // Merge static peers with the live "You" row, then sort
  const players: Player[] = useMemo(() => {
    const all: Player[] = [
      ...STATIC_PLAYERS,
      {
        name: 'You',
        avatar: false,
        points: totalScore,
        exactScores: Object.values(matchPredictions).filter((p) => p.pointsEarned >= 15).length,
        form: ['W', 'D', 'L', 'W', 'W'],
        isCurrentUser: true,
        badge: totalScore > BASE_SCORE
          ? `Up ${BASE_RANK - (PEER_SCORES.filter(s => s > totalScore).length + 1)} spot${BASE_RANK - (PEER_SCORES.filter(s => s > totalScore).length + 1) !== 1 ? 's' : ''}`
          : undefined,
      },
    ];
    return all
      .sort((a, b) => b.points - a.points)
      .map((p, i) => ({ ...p, rank: i + 1 }));
  }, [totalScore, matchPredictions]);

  return (
    <main className="min-h-screen bg-background px-5 py-10 max-w-[80rem] mx-auto">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-tertiary-container text-[32px]">sports_bar</span>
              <h1 className="font-h1 text-h1 text-primary leading-none">Vlinder League Standings</h1>
            </div>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              The battle for the top spot heats up. Every exact score counts.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <InfoPill icon="emoji_events" label="Prize"         value="Beers" />
            <InfoPill icon="sports_soccer" label="Matches Left" value="12" />
          </div>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div className="bg-surface-container/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="grid grid-cols-[60px_1fr_100px_100px_150px] bg-surface-container-high border-b border-white/10 px-4 py-3">
          <span className="font-label-caps text-label-caps text-on-surface-variant">Rank</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant">Manager</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant text-right">Points</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant text-right hidden sm:block">Exact</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant text-right hidden md:block">Last 5</span>
        </div>

        {/* Rows */}
        <motion.div className="divide-y divide-white/5" layout>
          <AnimatePresence initial={false}>
            {players.map((player) => (
              <PlayerRow key={player.name} player={player} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function InfoPill({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-surface-container-highest border border-white/5 rounded-xl px-4 py-3">
      <span className="material-symbols-outlined text-tertiary-container text-[20px]">{icon}</span>
      <div>
        <p className="font-label-caps text-label-caps text-on-surface-variant leading-none">{label}</p>
        <p className="font-body-md font-semibold text-primary mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function PlayerRow({ player }: { player: Player }) {
  const { isCurrentUser } = player;

  // Flash highlight when rank/points change
  const prevRankRef  = useRef(player.rank);
  const prevPtsRef   = useRef(player.points);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const rankChanged  = prevRankRef.current  !== player.rank;
    const pointsChanged = prevPtsRef.current  !== player.points;
    if ((rankChanged || pointsChanged) && (isCurrentUser || rankChanged)) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 800);
      prevRankRef.current  = player.rank;
      prevPtsRef.current   = player.points;
      return () => clearTimeout(t);
    }
    prevRankRef.current  = player.rank;
    prevPtsRef.current   = player.points;
  }, [player.rank, player.points, isCurrentUser]);

  return (
    <motion.div
      layout
      layoutId={player.name}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={[
        'grid grid-cols-[60px_1fr_100px_100px_150px] items-center px-4 py-4',
        'hover:bg-white/5 group relative overflow-hidden',
        isCurrentUser
          ? 'bg-primary-container/5 border-y border-primary-container shadow-[inset_0_0_20px_rgba(195,244,0,0.05)]'
          : '',
      ].join(' ')}
    >
      {/* Rank-change flash overlay */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key="flash"
            initial={{ opacity: 0.35 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={[
              'absolute inset-0 pointer-events-none',
              isCurrentUser
                ? 'bg-primary-container/20'
                : 'bg-secondary/10',
            ].join(' ')}
          />
        )}
      </AnimatePresence>

      {isCurrentUser && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary-container" />
      )}

      {/* Rank */}
      <div className="pl-1">
        <span className={[
          'font-h3 text-h3',
          player.rank === 1  ? 'text-tertiary-container'
          : isCurrentUser   ? 'text-primary-container'
          : 'text-on-surface-variant',
        ].join(' ')}>
          {player.rank}
        </span>
      </div>

      {/* Manager */}
      <div className="flex items-center gap-3 min-w-0">
        <Avatar player={player} />
        <div className="min-w-0">
          <p className="font-body-md font-semibold text-primary truncate group-hover:text-tertiary-container transition-colors duration-150">
            {player.name}
          </p>
          {player.badge && (
            <div className={`flex items-center gap-1 mt-0.5 ${isCurrentUser ? 'text-primary-container' : 'text-tertiary-container'}`}>
              {isCurrentUser && (
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
              )}
              <span className="font-label-caps text-[10px] uppercase tracking-wider">{player.badge}</span>
            </div>
          )}
        </div>
      </div>

      {/* Points — ticker for current user, static for others */}
      <div className="text-right">
        <span className={[
          'font-h3 text-h3 tabular-nums',
          isCurrentUser ? 'text-primary-container' : 'text-primary',
        ].join(' ')}>
          {isCurrentUser
            ? <NumberTicker value={player.points} />
            : player.points.toLocaleString()}
        </span>
      </div>

      {/* Exact Scores */}
      <div className="text-right hidden sm:block">
        <span className="font-body-md text-on-surface-variant tabular-nums">{player.exactScores}</span>
      </div>

      {/* Last 5 */}
      <div className="justify-end gap-1 hidden md:flex">
        {(player.form as FormResult[]).map((result, i) => (
          <FormBadge key={i} result={result} />
        ))}
      </div>
    </motion.div>
  );
}

function Avatar({ player }: { player: Player }) {
  const borderClass = player.rank === 1
    ? 'border-2 border-tertiary-container'
    : 'border border-surface-bright';

  return (
    <div className={`w-10 h-10 rounded-full flex-shrink-0 bg-surface-container-high flex items-center justify-center ${borderClass}`}>
      <span className="font-label-caps text-sm text-on-surface-variant">
        {player.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
}

type FormResult = 'W' | 'D' | 'L';

function FormBadge({ result }: { result: FormResult }) {
  const styles: Record<FormResult, string> = {
    W: 'bg-[rgba(171,214,0,0.2)] text-[#abd600] border border-[rgba(171,214,0,0.5)]',
    D: 'bg-[rgba(225,226,231,0.2)] text-[#e1e2e7] border border-[rgba(225,226,231,0.5)]',
    L: 'bg-[rgba(255,180,171,0.2)] text-[#ffb4ab] border border-[rgba(255,180,171,0.5)]',
  };
  return (
    <div className={`w-6 h-6 rounded flex items-center justify-center font-label-caps text-[10px] ${styles[result]}`}>
      {result}
    </div>
  );
}

/* ── Types & data ────────────────────────────────────────────────────────── */

interface Player {
  rank?: number;
  name: string;
  avatar: boolean;
  badge?: string;
  points: number;
  exactScores: number;
  form: string[];
  isCurrentUser?: boolean;
}

/** Static scores used by PredictionContext for rank computation — must stay in sync. */
const PEER_SCORES = [1245, 1180, 1140, 1095, 1060, 1020, 985, 960, 940, 915, 900, 845];

const STATIC_PLAYERS: Player[] = [
  { name: 'Alex Mercer',   avatar: true,  badge: 'Current Leader', points: 1245, exactScores: 8, form: ['W','W','D','W','W'] },
  { name: 'Sarah Jenkins', avatar: true,  points: 1180, exactScores: 6, form: ['W','L','W','W','D'] },
  { name: 'Mike T.',       avatar: false, points: 1140, exactScores: 7, form: ['L','W','W','L','W'] },
  { name: 'Priya K.',      avatar: false, points: 1095, exactScores: 5, form: ['W','W','L','D','W'] },
  { name: 'Tom B.',        avatar: true,  points: 1060, exactScores: 4, form: ['D','W','W','W','L'] },
  { name: 'Lena V.',       avatar: false, points: 1020, exactScores: 6, form: ['W','D','W','L','W'] },
  { name: 'James P.',      avatar: false, points: 985,  exactScores: 3, form: ['L','W','D','W','W'] },
  { name: 'Aisha N.',      avatar: true,  points: 960,  exactScores: 5, form: ['W','W','W','D','L'] },
  { name: 'Carlos M.',     avatar: false, points: 940,  exactScores: 4, form: ['D','L','W','W','W'] },
  { name: 'Yuki S.',       avatar: false, points: 915,  exactScores: 3, form: ['W','L','W','D','W'] },
  { name: 'Raj D.',        avatar: false, points: 900,  exactScores: 4, form: ['W','L','W','D','W'] },
  { name: 'Emma W.',       avatar: false, points: 845,  exactScores: 3, form: ['L','W','W','L','D'] },
];
