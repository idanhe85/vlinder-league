'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/app/context/AuthContext';
import { NumberTicker } from '@/app/components/NumberTicker';

interface Player {
  rank?: number;
  id: string;
  username: string;
  display_name: string | null;
  total_points: number;
  predictions_made: number;
  props_made: number;
  isCurrentUser?: boolean;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('total_points', { ascending: false });

      if (error) {
        console.error('Leaderboard fetch error:', error);
        setLoading(false);
        return;
      }

      const ranked: Player[] = (data ?? []).map((row, i) => ({
        id:               row.id,
        username:         row.username ?? 'Player',
        display_name:     row.display_name,
        total_points:     Number(row.total_points),
        predictions_made: Number(row.predictions_made),
        props_made:       Number(row.props_made),
        rank:             i + 1,
        isCurrentUser:    row.id === user?.id,
      }));

      setPlayers(ranked);
      setLoading(false);
    }

    fetchLeaderboard();
  }, [user?.id]);

  const topPlayer = players[0];

  return (
    <main className="min-h-screen bg-background px-5 py-10 max-w-[80rem] mx-auto">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border border-white/10 rounded-2xl p-6 mb-8">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/insights_background.jpg)' }} />
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #111417 20%, transparent 100%)' }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            <InfoPill icon="emoji_events"  label="Prize"   value="Beers" />
            <InfoPill icon="group"         label="Players" value={String(players.length)} />
          </div>
        </div>
      </div>

      {/* ── Podium ───────────────────────────────────────────────────── */}
      {!loading && players.length >= 1 && (
        <Podium players={players} currentUserId={user?.id} />
      )}

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div className="bg-surface-container/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="grid grid-cols-[60px_1fr_100px_120px_120px] bg-surface-container-high border-b border-white/10 px-4 py-3">
          <span className="font-label-caps text-label-caps text-on-surface-variant">Rank</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant">Player</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant text-right">Points</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant text-right hidden sm:block">Matches</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant text-right hidden md:block">Props</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="divide-y divide-white/5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[60px_1fr_100px_120px_120px] items-center px-4 py-4 animate-pulse">
                <div className="w-6 h-5 bg-white/10 rounded" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10" />
                  <div className="w-28 h-4 bg-white/10 rounded" />
                </div>
                <div className="ml-auto w-12 h-5 bg-white/10 rounded" />
                <div className="ml-auto w-8 h-5 bg-white/10 rounded hidden sm:block" />
                <div className="ml-auto w-8 h-5 bg-white/10 rounded hidden md:block" />
              </div>
            ))}
          </div>
        ) : players.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px]">leaderboard</span>
            <p className="font-body-lg text-body-lg">No predictions yet — be the first!</p>
          </div>
        ) : (
          <motion.div className="divide-y divide-white/5" layout>
            <AnimatePresence initial={false}>
              {players.map((player) => (
                <PlayerRow key={player.id} player={player} topPlayer={topPlayer} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </main>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

const PODIUM_CONFIG = {
  1: { height: 'h-28', color: '#ffe088', label: 'GOLD',   size: 'w-20 h-20', textSize: 'text-xl',  crown: true  },
  2: { height: 'h-20', color: '#c8d4e8', label: 'SILVER', size: 'w-16 h-16', textSize: 'text-base', crown: false },
  3: { height: 'h-14', color: '#c8956c', label: 'BRONZE', size: 'w-14 h-14', textSize: 'text-sm',  crown: false },
} as const;

function Podium({ players, currentUserId }: { players: Player[]; currentUserId?: string }) {
  // Podium visual order: 2nd | 1st | 3rd
  const slots: Array<{ pos: 1 | 2 | 3; player?: Player }> = [
    { pos: 2, player: players[1] },
    { pos: 1, player: players[0] },
    { pos: 3, player: players[2] },
  ];

  return (
    <div className="mb-8 flex items-end justify-center gap-3 sm:gap-6 px-4">
      {slots.map(({ pos, player }) => {
        const cfg = PODIUM_CONFIG[pos];
        if (!player) {
          // Empty slot placeholder
          return (
            <div key={pos} className="flex flex-col items-center gap-2 flex-1 max-w-[160px]">
              <div className={`${cfg.size} rounded-full bg-surface-container-highest border border-white/10 opacity-30`} />
              <div className={`w-full ${cfg.height} rounded-t-xl bg-surface-container-highest/30 border border-white/5 flex items-center justify-center`}>
                <span className="font-h2 text-2xl text-white/10">{pos}</span>
              </div>
            </div>
          );
        }

        const displayName = player.display_name || player.username;
        const initials = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
        const isYou = player.id === currentUserId;

        return (
          <motion.div
            key={pos}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: pos === 1 ? 0.1 : pos === 2 ? 0.2 : 0.3, duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col items-center gap-2 flex-1 max-w-[160px]"
          >
            {/* Crown for 1st */}
            {cfg.crown && (
              <motion.span
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
                className="text-2xl leading-none"
                aria-hidden="true"
              >
                👑
              </motion.span>
            )}

            {/* Avatar */}
            <div
              className={`${cfg.size} rounded-full bg-surface-container-highest flex items-center justify-center border-2 shadow-lg flex-shrink-0`}
              style={{ borderColor: cfg.color, boxShadow: `0 0 20px ${cfg.color}40` }}
            >
              <span className={`font-label-caps font-bold text-on-surface-variant ${cfg.textSize}`}>{initials}</span>
            </div>

            {/* Name */}
            <div className="text-center">
              <p className="font-body-md font-semibold text-sm text-primary leading-tight truncate max-w-[120px]">
                {displayName}
                {isYou && <span className="ml-1 text-[10px] text-primary-container">You</span>}
              </p>
              <p className="font-label-caps text-[11px] tabular-nums mt-0.5" style={{ color: cfg.color }}>
                {player.total_points.toLocaleString()} pts
              </p>
            </div>

            {/* Podium block */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: pos === 1 ? 0 : pos === 2 ? 0.1 : 0.15, duration: 0.35, ease: 'easeOut' }}
              style={{ originY: 1, background: `linear-gradient(to bottom, ${cfg.color}22, ${cfg.color}0a)`, borderColor: `${cfg.color}40` }}
              className={`w-full ${cfg.height} rounded-t-xl border border-b-0 flex items-center justify-center`}
            >
              <span className="font-h2 font-extrabold text-3xl" style={{ color: `${cfg.color}60` }}>{pos}</span>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

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

function PlayerRow({ player, topPlayer }: { player: Player; topPlayer?: Player }) {
  const { isCurrentUser } = player;
  const isLeader = player.rank === 1;

  const prevRankRef = useRef(player.rank);
  const prevPtsRef  = useRef(player.total_points);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const rankChanged   = prevRankRef.current !== player.rank;
    const pointsChanged = prevPtsRef.current  !== player.total_points;
    if ((rankChanged || pointsChanged) && (isCurrentUser || rankChanged)) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 800);
      prevRankRef.current = player.rank;
      prevPtsRef.current  = player.total_points;
      return () => clearTimeout(t);
    }
    prevRankRef.current = player.rank;
    prevPtsRef.current  = player.total_points;
  }, [player.rank, player.total_points, isCurrentUser]);

  const displayName = player.display_name || player.username;
  const initials = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  // Points gap vs leader
  const gap = topPlayer && !isLeader ? topPlayer.total_points - player.total_points : null;

  return (
    <motion.div
      layout
      layoutId={player.id}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={[
        'grid grid-cols-[60px_1fr_100px_120px_120px] items-center px-4 py-4',
        'hover:bg-white/5 group relative overflow-hidden',
        isCurrentUser
          ? 'bg-primary-container/5 border-y border-primary-container/30 shadow-[inset_0_0_20px_rgba(195,244,0,0.05)]'
          : '',
      ].join(' ')}
    >
      {/* Flash overlay */}
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
              isCurrentUser ? 'bg-primary-container/20' : 'bg-secondary/10',
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
          isLeader      ? 'text-tertiary-container'
          : isCurrentUser ? 'text-primary-container'
          : 'text-on-surface-variant',
        ].join(' ')}>
          {isLeader ? '🏆' : player.rank}
        </span>
      </div>

      {/* Player */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={[
          'w-10 h-10 rounded-full flex-shrink-0 bg-surface-container-high flex items-center justify-center',
          isLeader      ? 'border-2 border-tertiary-container'
          : isCurrentUser ? 'border-2 border-primary-container/50'
          : 'border border-surface-bright',
        ].join(' ')}>
          <span className="font-label-caps text-sm text-on-surface-variant">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="font-body-md font-semibold text-primary truncate group-hover:text-tertiary-container transition-colors duration-150">
            {displayName}
            {isCurrentUser && (
              <span className="ml-2 font-label-caps text-[10px] text-primary-container uppercase tracking-wider">You</span>
            )}
          </p>
          <p className="font-label-caps text-[10px] text-on-surface-variant truncate">
            @{player.username}
            {gap !== null && (
              <span className="ml-1.5 text-outline">· -{gap} pts</span>
            )}
          </p>
        </div>
      </div>

      {/* Points */}
      <div className="text-right">
        <span className={[
          'font-h3 text-h3 tabular-nums',
          isCurrentUser ? 'text-primary-container' : 'text-primary',
        ].join(' ')}>
          {isCurrentUser
            ? <NumberTicker value={player.total_points} />
            : player.total_points.toLocaleString()}
        </span>
      </div>

      {/* Predictions */}
      <div className="text-right hidden sm:block">
        <span className="font-body-md text-on-surface-variant tabular-nums">{player.predictions_made}</span>
      </div>

      {/* Props */}
      <div className="text-right hidden md:block">
        <span className="font-body-md text-on-surface-variant tabular-nums">{player.props_made}</span>
      </div>
    </motion.div>
  );
}
