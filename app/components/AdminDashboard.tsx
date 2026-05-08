'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

// ── Animation variants ────────────────────────────────────────────────────

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
};

const AdminBtn = ({
  children, onClick, variant = 'primary', disabled = false, className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'danger' | 'secondary' | 'surface';
  disabled?: boolean;
  className?: string;
}) => {
  const styles = {
    primary:   'bg-primary-container text-on-primary-container hover:bg-primary-fixed-dim',
    danger:    'bg-error-container text-on-error-container hover:brightness-110',
    secondary: 'border border-secondary text-secondary hover:bg-secondary/10',
    surface:   'bg-surface-container-high border border-white/10 text-on-surface hover:bg-surface-bright',
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.96 }}
      className={[
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
        'font-label-caps text-label-caps transition-all duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        styles[variant],
        className,
      ].join(' ')}
    >
      {children}
    </motion.button>
  );
};

// ── Section A: API & Data Controls ────────────────────────────────────────

interface MatchOption { match_id: string; match_label: string; group: string; matchday: number; }

function ApiDataControls() {
  const [matchId,   setMatchId]   = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [saving,    setSaving]    = useState(false);
  const [matches,   setMatches]   = useState<MatchOption[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  // Fetch all WC 2026 fixtures from the football API
  useEffect(() => {
    fetch('/api/football/matches')
      .then((r) => r.json())
      .then(({ matches: all }) => {
        if (!all) return;
        const opts: MatchOption[] = (all as Array<{
          id: number;
          stage: string;
          group: string | null;
          matchday: number;
          homeTeam: { tla: string };
          awayTeam: { tla: string };
        }>).map((m) => ({
          match_id:    String(m.id),
          match_label: `${m.homeTeam.tla} vs ${m.awayTeam.tla}`,
          group:       m.group ? m.group.replace('GROUP_', 'Group ') : m.stage.replace(/_/g, ' '),
          matchday:    m.matchday,
        }));
        setMatches(opts);
      })
      .finally(() => setLoadingMatches(false));
  }, []);

  async function handleScoreSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/score-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_id:   matchId,
          home_score: Number(homeScore),
          away_score: Number(awayScore),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success('Scores updated', {
        description: `${json.updated} prediction${json.updated !== 1 ? 's' : ''} scored.`,
        icon: '✅',
      });
      setMatchId(''); setHomeScore(''); setAwayScore('');
    } catch (err) {
      toast.error('Failed to score match', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div variants={card} className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/5">
        <span className="material-symbols-outlined text-primary-container text-[20px]">scoreboard</span>
        <h2 className="font-h3 text-h3 text-primary">Score Match Results</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Instructions */}
        <div className="flex flex-col gap-3">
          <p className="font-label-caps text-label-caps text-on-surface-variant">HOW IT WORKS</p>
          <div className="flex flex-col gap-2">
            {[
              { pts: '45 pts', label: 'Exact score' },
              { pts: '30 pts', label: 'Correct outcome (win/draw/loss)' },
              { pts: '0 pts',  label: 'Wrong prediction' },
            ].map(({ pts, label }) => (
              <div key={pts} className="flex items-center gap-3 bg-surface-container-high border border-white/5 rounded-lg px-4 py-2.5">
                <span className="font-h3 text-h3 text-primary-container w-16 shrink-0">{pts}</span>
                <span className="font-body-md text-sm text-on-surface-variant">{label}</span>
              </div>
            ))}
          </div>
          <p className="font-label-caps text-[10px] text-on-surface-variant mt-1">
            All 104 WC 2026 fixtures are available. Scoring a match awards points to every user who predicted it.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleScoreSave} className="flex flex-col gap-3">
          <p className="font-label-caps text-label-caps text-on-surface-variant">ENTER RESULT</p>

          <select
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            className="input-field bg-surface-container-highest"
            required
          >
            <option value="">
              {loadingMatches ? 'Loading fixtures…' : 'Select a fixture…'}
            </option>
            {/* Group stage — grouped by matchday */}
            {[1, 2, 3].map((md) => {
              const mdMatches = matches.filter((m) => m.matchday === md && m.group.startsWith('Group'));
              if (mdMatches.length === 0) return null;
              return (
                <optgroup key={`md${md}`} label={`Matchday ${md}`}>
                  {mdMatches.map((m) => (
                    <option key={m.match_id} value={m.match_id}>
                      {m.match_label} ({m.group})
                    </option>
                  ))}
                </optgroup>
              );
            })}
            {/* Knockout stage */}
            {matches.filter((m) => !m.group.startsWith('Group')).length > 0 && (
              <optgroup label="Knockout">
                {matches.filter((m) => !m.group.startsWith('Group')).map((m) => (
                  <option key={m.match_id} value={m.match_id}>
                    {m.match_label} ({m.group})
                  </option>
                ))}
              </optgroup>
            )}
          </select>

          <div className="flex items-center gap-2">
            <input
              type="number" min={0} max={20} placeholder="Home"
              value={homeScore} onChange={(e) => setHomeScore(e.target.value)}
              className="input-field text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              required
            />
            <span className="font-h3 text-h3 text-on-surface-variant flex-shrink-0">:</span>
            <input
              type="number" min={0} max={20} placeholder="Away"
              value={awayScore} onChange={(e) => setAwayScore(e.target.value)}
              className="input-field text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              required
            />
          </div>

          <motion.button
            type="submit"
            disabled={saving || loadingMatches}
            whileTap={{ scale: 0.96 }}
            className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
                Scoring…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">scoreboard</span>
                Submit Result & Score
              </>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}

// ── Section B: User Oversight ─────────────────────────────────────────────

const AVATAR_OPTIONS = [
  '/images/De "Biertijd" Woede.gif',
  '/images/De Bal en Bier Balansact.gif',
  '/images/De Barbon-Straf.gif',
  '/images/De Bidon Stout-Plons.gif',
  '/images/De Bierkan Inworp.gif',
  '/images/De Donker Bier Wereldbeker.gif',
  '/images/De Duikende Pint-Redding.gif',
  '/images/De Frustratie van het Lege Glas.gif',
  '/images/De Fust-Kopbal.gif',
  '/images/De Kus op de Bieretiket-Aanvoerdersband.gif',
  '/images/De Kus op de Gouden Biertrofee.gif',
  '/images/De Kus op de Viltjessjaal.gif',
  '/images/De Magische Bierspons.gif',
  '/images/De Modderige Overwinningskreet.gif',
  '/images/De Modderige Schuim-Veger.gif',
  '/images/De Nerveuze Stout-Bezorging.gif',
  '/images/De Pintjes-Opstelling Tactiek.gif',
  '/images/De Pretzel-Microfoon Schok.gif',
  '/images/De Snack- en Biertactiek.gif',
  '/images/De Speciaalbier Waarschuwingskaart.gif',
  '/images/De Taphendel Strijdkreet.gif',
  '/images/De Uitgeputte Pint na de Wedstrijd.gif',
  '/images/De VAR-Biertap Review.gif',
  '/images/De Viltjes-Strafkaart.gif',
  '/images/De Voetbal Bierhelm.gif',
  '/images/De Vuvuzela Schuimknoei.gif',
  '/images/Gouden Schoen.gif',
  '/images/Het Biertje van de Fanatieke Supporter.gif',
  '/images/Het Happy Hour Wisselbord.gif',
  '/images/Het Troostbiertje.gif',
];

interface UserRow {
  id: string;
  display_name: string | null;
  username: string;
  is_admin: boolean;
  total_points: number;
  avatar_url: string | null;
}

interface RoundMatch { id: string; label: string; }

function StatusDot({ filled, title }: { filled: boolean; title?: string }) {
  return (
    <div
      title={title ?? (filled ? 'Submitted' : 'Not submitted')}
      className={[
        'w-2.5 h-2.5 rounded-full flex-shrink-0',
        filled
          ? 'bg-primary-container shadow-[0_0_8px_rgba(195,244,0,0.8)]'
          : 'bg-error shadow-[0_0_8px_rgba(255,180,171,0.7)]',
      ].join(' ')}
    />
  );
}

function UserOversight() {
  const [search,       setSearch]       = useState('');
  const [users,        setUsers]        = useState<UserRow[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [roundMatches, setRoundMatches] = useState<RoundMatch[]>([]);
  const [matchday,     setMatchday]     = useState<number | null>(null);
  const [predMap,      setPredMap]      = useState<Map<string, Set<string>>>(new Map());
  // avatar picker state
  const [pickerUserId, setPickerUserId] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // 1. Users from leaderboard + admin flag + avatar
    supabase
      .from('leaderboard')
      .select('id, display_name, username, total_points')
      .then(async ({ data }) => {
        if (!data) { setLoading(false); return; }
        const { data: profiles } = await supabase.from('profiles').select('id, is_admin, avatar_url');
        const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
        setUsers(data.map((r) => ({
          id:           r.id,
          display_name: r.display_name,
          username:     r.username ?? '',
          is_admin:     profileMap.get(r.id)?.is_admin ?? false,
          total_points: Number(r.total_points),
          avatar_url:   profileMap.get(r.id)?.avatar_url ?? null,
        })));
        setLoading(false);
      });

    // 2. Current round from football API
    fetch('/api/football/matches')
      .then((r) => r.json())
      .then((data) => {
        const matches = (data.matches ?? []) as Array<{
          id: number; matchday: number; status: string;
          homeTeam: { tla: string }; awayTeam: { tla: string };
        }>;
        // Active = lowest matchday with upcoming/in-play matches
        const upcoming = matches.filter(
          (m) => m.status === 'TIMED' || m.status === 'SCHEDULED' || m.status === 'IN_PLAY',
        );
        const pool = upcoming.length > 0 ? upcoming : matches.filter((m) => m.status === 'FINISHED');
        if (pool.length === 0) return;
        const targetMd = upcoming.length > 0
          ? Math.min(...pool.map((m) => m.matchday ?? Infinity))
          : Math.max(...pool.map((m) => m.matchday ?? 0));
        const round = matches.filter((m) => m.matchday === targetMd);
        setMatchday(targetMd);
        setRoundMatches(round.map((m) => ({
          id: String(m.id),
          label: `${m.homeTeam.tla} vs ${m.awayTeam.tla}`,
        })));
      })
      .catch(() => {});

    // 3. All predictions → per-user match coverage
    supabase
      .from('match_predictions')
      .select('user_id, match_id')
      .then(({ data }) => {
        const map = new Map<string, Set<string>>();
        for (const row of data ?? []) {
          if (!map.has(row.user_id)) map.set(row.user_id, new Set());
          map.get(row.user_id)!.add(row.match_id);
        }
        setPredMap(map);
      });
  }, []);

  async function assignAvatar(userId: string, avatarUrl: string | null) {
    setSavingAvatar(true);
    try {
      const res = await fetch('/api/admin/set-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, avatarUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, avatar_url: avatarUrl } : u));
      setPickerUserId(null);
      toast.success('Avatar updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update avatar');
    } finally {
      setSavingAvatar(false);
    }
  }

  const filtered = users.filter((u) =>
    (u.display_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <motion.div variants={card} className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[20px]">group</span>
          <h2 className="font-h3 text-h3 text-primary">User Oversight</h2>
          <span className="font-label-caps text-label-caps bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant ml-1">
            {users.length}
          </span>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            className="input-field pl-9 py-2 text-sm w-full sm:w-52"
          />
        </div>
      </div>

      {/* Legend + matchday label */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-surface-container-high border-b border-white/5">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary-container shadow-[0_0_8px_rgba(195,244,0,0.8)]" />
            <span className="font-label-caps text-[10px] text-on-surface-variant">Submitted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-error shadow-[0_0_8px_rgba(255,180,171,0.7)]" />
            <span className="font-label-caps text-[10px] text-on-surface-variant">Missing</span>
          </div>
        </div>
        {matchday !== null && (
          <span className="font-label-caps text-[10px] text-primary-container bg-primary-container/10 border border-primary-container/20 px-2 py-0.5 rounded">
            Matchday {matchday}
          </span>
        )}
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[minmax(160px,1fr)_1fr_72px] px-6 py-2.5 bg-surface-container-high/50 border-b border-white/5">
        <span className="font-label-caps text-label-caps text-on-surface-variant">Player</span>
        <span className="font-label-caps text-label-caps text-on-surface-variant">
          {matchday !== null ? `MD ${matchday} Predictions` : 'Predictions'}
          {roundMatches.length > 0 && (
            <span className="text-on-surface-variant/50 ml-1">({roundMatches.length} matches)</span>
          )}
        </span>
        <span className="font-label-caps text-label-caps text-on-surface-variant text-right">Points</span>
      </div>

      {/* Rows */}
      {loading ? (
        <div className="divide-y divide-white/5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[minmax(160px,1fr)_1fr_72px] items-center px-6 py-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10" />
                <div className="w-24 h-3 bg-white/10 rounded" />
              </div>
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((__, j) => (
                  <div key={j} className="w-2.5 h-2.5 rounded-full bg-white/10" />
                ))}
              </div>
              <div className="w-10 h-3 bg-white/10 rounded ml-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {filtered.map((u) => {
            const name = u.display_name || u.username;
            const initials = name.slice(0, 2).toUpperCase();
            const userPreds = predMap.get(u.id) ?? new Set<string>();
            const isPickerOpen = pickerUserId === u.id;
            return (
              <div key={u.id} className="border-b border-white/5 last:border-0">
                <div className="grid grid-cols-[minmax(160px,1fr)_1fr_72px] items-center px-6 py-4 hover:bg-white/3">
                {/* Player */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar — click to open picker */}
                  <button
                    type="button"
                    onClick={() => setPickerUserId(isPickerOpen ? null : u.id)}
                    title="Set avatar"
                    className="w-8 h-8 rounded-full bg-surface-container-highest border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden hover:border-primary-container/50 transition-colors"
                  >
                    {u.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.avatar_url} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-label-caps text-[10px] text-on-surface-variant">{initials}</span>
                    )}
                  </button>
                  <div className="min-w-0">
                    <p className="font-body-md font-semibold text-primary text-sm truncate">{name}</p>
                    <p className="font-label-caps text-[10px] text-on-surface-variant">@{u.username}</p>
                  </div>
                  {u.is_admin && (
                    <span className="font-label-caps text-[9px] px-1.5 py-0.5 rounded bg-primary-container/20 text-primary-container border border-primary-container/30 flex-shrink-0">
                      ADMIN
                    </span>
                  )}
                </div>

                {/* Per-match dots — missing ones show match label */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  {roundMatches.length === 0 ? (
                    <span className="font-label-caps text-[10px] text-on-surface-variant/40">No fixtures</span>
                  ) : (
                    roundMatches.map((m) => {
                      const submitted = userPreds.has(m.id);
                      return submitted ? (
                        <StatusDot key={m.id} filled title={m.label} />
                      ) : (
                        <span
                          key={m.id}
                          className="inline-flex items-center gap-1.5 bg-error/10 border border-error/20 rounded px-1.5 py-0.5"
                        >
                          <StatusDot filled={false} />
                          <span className="font-label-caps text-[9px] text-error whitespace-nowrap">{m.label}</span>
                        </span>
                      );
                    })
                  )}
                </div>

                {/* Points */}
                <span className="font-body-md font-semibold text-primary tabular-nums text-sm text-right">
                  {u.total_points.toLocaleString()}
                </span>
              </div>

                {/* Avatar picker — expands inline */}
                <AnimatePresence>
                  {isPickerOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4">
                        <p className="font-label-caps text-[10px] text-on-surface-variant mb-3">
                          SELECT AVATAR FOR {name.toUpperCase()}
                        </p>
                        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                          {/* Remove avatar option */}
                          <button
                            type="button"
                            onClick={() => assignAvatar(u.id, null)}
                            disabled={savingAvatar}
                            title="Remove avatar"
                            className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-dashed border-white/20 flex items-center justify-center hover:border-error/50 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">close</span>
                          </button>
                          {AVATAR_OPTIONS.map((src) => (
                            <button
                              key={src}
                              type="button"
                              onClick={() => assignAvatar(u.id, src)}
                              disabled={savingAvatar}
                              title={src.split('/').pop()?.replace('.gif', '')}
                              className={[
                                'w-10 h-10 rounded-full overflow-hidden border-2 transition-all',
                                u.avatar_url === src
                                  ? 'border-primary-container scale-110'
                                  : 'border-white/10 hover:border-primary-container/50',
                              ].join(' ')}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={src} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ── Section C: Prop Bet Management ───────────────────────────────────────

interface PropBet {
  id: string;
  question: string;
  points: number;
  status: 'active' | 'won' | 'lost';
}

function PropBetManagement() {
  const [props,     setProps]     = useState<PropBet[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [question,  setQuestion]  = useState('');
  const [ptValue,   setPtValue]   = useState('');
  const [flashId,   setFlashId]   = useState<string | null>(null);
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('props')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setProps((data ?? []) as PropBet[]);
        setLoading(false);
      });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const id = `custom_${Date.now()}`;
    const newProp: PropBet = { id, question, points: Number(ptValue), status: 'active' };
    const supabase = createClient();
    const { error } = await supabase.from('props').insert(newProp);
    if (!error) {
      setProps((p) => [...p, newProp]);
      setQuestion('');
      setPtValue('');
      toast.success('Prop created');
    } else {
      toast.error('Failed to create prop', { description: error.message });
    }
  }

  async function resolve(id: string, status: 'won' | 'lost') {
    setResolving(id);
    setFlashId(id);
    try {
      const res = await fetch('/api/admin/resolve-prop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prop_id: id, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setProps((p) => p.map((prop) => prop.id === id ? { ...prop, status } : prop));
      toast.success(status === 'won' ? 'Prop marked as Won' : 'Prop marked as Lost', {
        description: `${json.updated} prediction${json.updated !== 1 ? 's' : ''} scored.`,
        icon: status === 'won' ? '✅' : '❌',
      });
    } catch (err) {
      toast.error('Failed to resolve prop', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setResolving(null);
      setTimeout(() => setFlashId(null), 600);
    }
  }

  const statusStyle: Record<PropBet['status'], string> = {
    active: 'bg-secondary/10 text-secondary border-secondary/30',
    won:    'bg-primary-container/10 text-primary-container border-primary-container/30',
    lost:   'bg-error/10 text-error border-error/30',
  };

  return (
    <motion.div variants={card} className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/5">
        <span className="material-symbols-outlined text-tertiary-container text-[20px]">military_tech</span>
        <h2 className="font-h3 text-h3 text-primary">Prop Bet Management</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create form */}
        <div>
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-3">CREATE NEW PROP</p>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Argentina wins the Golden Boot"
              required
              className="input-field"
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={ptValue}
                onChange={(e) => setPtValue(e.target.value)}
                placeholder="Point value"
                min={1}
                required
                className="input-field [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <AdminBtn variant="primary" className="flex-shrink-0 whitespace-nowrap">
                <span className="material-symbols-outlined text-[16px]">add</span>
                Create Prop
              </AdminBtn>
            </div>
          </form>
        </div>

        {/* Props list */}
        <div>
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-3">
            ALL PROPS ({props.length})
          </p>
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
              ))
            ) : (
            <AnimatePresence initial={false}>
              {props.map((prop) => (
                <motion.div
                  key={prop.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: flashId === prop.id ? 0.5 : 1, x: 0 }}
                  exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 bg-surface-container-high border border-white/5 rounded-xl px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md text-sm text-on-surface truncate">{prop.question}</p>
                    <span className={`font-label-caps text-[10px] px-2 py-0.5 rounded border mt-1 inline-block ${statusStyle[prop.status]}`}>
                      {prop.status.toUpperCase()} · {prop.points} PTS
                    </span>
                  </div>

                  {prop.status === 'active' && (
                    <div className="flex gap-1 flex-shrink-0">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.88 }}
                        disabled={resolving === prop.id}
                        onClick={() => resolve(prop.id, 'won')}
                        title="Mark as Won"
                        className="w-7 h-7 rounded-lg bg-primary-container/10 border border-primary-container/30 text-primary-container hover:bg-primary-container/20 flex items-center justify-center transition-colors disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      </motion.button>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.88 }}
                        disabled={resolving === prop.id}
                        onClick={() => resolve(prop.id, 'lost')}
                        title="Mark as Lost"
                        className="w-7 h-7 rounded-lg bg-error/10 border border-error/30 text-error hover:bg-error/20 flex items-center justify-center transition-colors disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Section D: Danger Zone ────────────────────────────────────────────────

function DangerZone() {
  const [confirm, setConfirm] = useState(false);
  const [busy,    setBusy]    = useState(false);

  async function handleReset() {
    setBusy(true);
    try {
      const res  = await fetch('/api/admin/reset-all', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Reset failed');
      toast.success('League reset complete', {
        description: 'All predictions and scores have been cleared.',
        icon: '🗑️',
      });
      setConfirm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div variants={card} className="bg-error/5 border border-error/20 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-error text-[20px]">warning</span>
        <h2 className="font-h3 text-h3 text-error">Danger Zone</h2>
      </div>
      <p className="text-on-surface-variant text-sm mb-5">
        Use before tournament start to give everyone a clean slate.
      </p>

      <div className="bg-surface-container/60 border border-error/20 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-bold text-on-surface text-sm">Reset entire league</p>
          <p className="text-on-surface-variant text-xs mt-0.5">
            Deletes all match &amp; prop predictions · resets all scores to 0
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!confirm ? (
            <motion.div key="initial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AdminBtn variant="danger" onClick={() => setConfirm(true)}>
                <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                Reset all
              </AdminBtn>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <span className="text-error text-xs font-bold">Are you sure?</span>
              <AdminBtn variant="surface" onClick={() => setConfirm(false)} disabled={busy}>
                Cancel
              </AdminBtn>
              <AdminBtn variant="danger" onClick={handleReset} disabled={busy}>
                {busy ? 'Resetting…' : 'Yes, reset everything'}
              </AdminBtn>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────

export function AdminDashboard() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <motion.div variants={card}>
        <div className="flex items-center gap-3 mb-1">
          <span className="material-symbols-outlined text-error text-[22px]">admin_panel_settings</span>
          <h1 className="font-h2 text-h2 text-primary">Admin Panel</h1>
          <span className="font-label-caps text-label-caps bg-error/10 text-error border border-error/30 px-2 py-0.5 rounded text-[10px]">
            RESTRICTED
          </span>
        </div>
        <p className="text-on-surface-variant text-sm">
          Full control over league data, users, and prop bets.
        </p>
      </motion.div>

      <ApiDataControls />
      <UserOversight />
      <PropBetManagement />
      <DangerZone />
    </motion.div>
  );
}
