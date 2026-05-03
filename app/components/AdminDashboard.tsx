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

interface MatchOption { match_id: string; match_label: string; }

function ApiDataControls() {
  const [matchId,   setMatchId]   = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [saving,    setSaving]    = useState(false);
  const [matches,   setMatches]   = useState<MatchOption[]>([]);

  // Fetch distinct matches that have at least one prediction
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('match_predictions')
      .select('match_id, match_label')
      .then(({ data }) => {
        if (!data) return;
        const seen = new Set<string>();
        const unique: MatchOption[] = [];
        for (const row of data) {
          if (!seen.has(row.match_id)) {
            seen.add(row.match_id);
            unique.push({ match_id: row.match_id, match_label: row.match_label });
          }
        }
        setMatches(unique);
      });
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
              { pts: '10 pts', label: 'Exact score predicted correctly' },
              { pts: '5 pts',  label: 'Correct outcome (win/draw/loss)' },
              { pts: '0 pts',  label: 'Wrong prediction' },
            ].map(({ pts, label }) => (
              <div key={pts} className="flex items-center gap-3 bg-surface-container-high border border-white/5 rounded-lg px-4 py-2.5">
                <span className="font-h3 text-h3 text-primary-container w-16 shrink-0">{pts}</span>
                <span className="font-body-md text-sm text-on-surface-variant">{label}</span>
              </div>
            ))}
          </div>
          <p className="font-label-caps text-[10px] text-on-surface-variant mt-1">
            Only matches with saved predictions appear in the dropdown.
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
              {matches.length === 0 ? 'No predictions saved yet…' : 'Select a fixture…'}
            </option>
            {matches.map((m) => (
              <option key={m.match_id} value={m.match_id}>{m.match_label}</option>
            ))}
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
            disabled={saving || matches.length === 0}
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

const MOCK_USERS = [
  { id: '1', name: 'E_dan',   username: 'idan_hemo', points: 0,  predictions: 0,  role: 'Admin',  active: true  },
  { id: '2', name: 'Rico_Ko', username: 'rico_kiko', points: 0,  predictions: 0,  role: 'Player', active: true  },
  { id: '3', name: 'Alex M.', username: 'alexm',     points: 1245, predictions: 18, role: 'Player', active: true  },
  { id: '4', name: 'Sarah J.', username: 'sarahj',   points: 1180, predictions: 15, role: 'Player', active: true  },
  { id: '5', name: 'Mike T.', username: 'miket',     points: 1140, predictions: 14, role: 'Player', active: false },
];

function UserOversight() {
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = MOCK_USERS.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
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
            {MOCK_USERS.length}
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

      {/* Table header */}
      <div className="grid grid-cols-[1fr_80px_80px_90px_80px] px-6 py-2.5 bg-surface-container-high border-b border-white/5">
        {['Player', 'Points', 'Preds', 'Role', 'Actions'].map((h) => (
          <span key={h} className="font-label-caps text-label-caps text-on-surface-variant">{h}</span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/5">
        {filtered.map((u) => (
          <div key={u.id} className="grid grid-cols-[1fr_80px_80px_90px_80px] items-center px-6 py-3 hover:bg-white/3 group relative">
            {/* Player */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-white/10 flex items-center justify-center flex-shrink-0">
                <span className="font-label-caps text-[10px] text-on-surface-variant">
                  {u.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-body-md font-semibold text-primary text-sm">{u.name}</p>
                <p className="font-label-caps text-[10px] text-on-surface-variant">@{u.username}</p>
              </div>
              <div className={`w-1.5 h-1.5 rounded-full ml-1 ${u.active ? 'bg-primary-container shadow-[0_0_6px_#c3f400]' : 'bg-outline'}`} />
            </div>
            {/* Points */}
            <span className="font-body-md font-semibold text-primary tabular-nums text-sm">{u.points.toLocaleString()}</span>
            {/* Predictions */}
            <span className="text-on-surface-variant text-sm tabular-nums">{u.predictions}</span>
            {/* Role */}
            <span className={[
              'font-label-caps text-label-caps px-2 py-0.5 rounded text-[10px] w-fit',
              u.role === 'Admin'
                ? 'bg-primary-container/20 text-primary-container border border-primary-container/30'
                : 'bg-surface-container-highest text-on-surface-variant',
            ].join(' ')}>
              {u.role}
            </span>
            {/* Actions */}
            <div className="relative">
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">more_vert</span>
              </motion.button>

              <AnimatePresence>
                {openMenu === u.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -4 }}
                    animate={{ opacity: 1, scale: 1,    y: 0  }}
                    exit={{    opacity: 0, scale: 0.92, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-8 z-20 w-36 bg-surface-container-high border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                  >
                    {['Edit Points', 'Reset Password', 'Ban User'].map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => setOpenMenu(null)}
                        className={[
                          'w-full text-left px-4 py-2.5 text-sm font-body-md transition-colors',
                          action === 'Ban User'
                            ? 'text-error hover:bg-error/10'
                            : 'text-on-surface hover:bg-white/5',
                        ].join(' ')}
                      >
                        {action}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
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

const INITIAL_PROPS: PropBet[] = [
  { id: '1', question: 'Total Tournament Goals > 150', points: 10, status: 'active' },
  { id: '2', question: 'Brazil wins the tournament',   points: 20, status: 'active' },
  { id: '3', question: 'More than 5 red cards in QFs', points: 15, status: 'active' },
];

function PropBetManagement() {
  const [props,     setProps]     = useState<PropBet[]>(INITIAL_PROPS);
  const [question,  setQuestion]  = useState('');
  const [ptValue,   setPtValue]   = useState('');
  const [flashId,   setFlashId]   = useState<string | null>(null);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const newProp: PropBet = {
      id: Date.now().toString(),
      question,
      points: Number(ptValue),
      status: 'active',
    };
    setProps((p) => [newProp, ...p]);
    setQuestion('');
    setPtValue('');
  }

  function resolve(id: string, status: 'won' | 'lost') {
    setFlashId(id);
    setProps((p) => p.map((prop) => prop.id === id ? { ...prop, status } : prop));
    setTimeout(() => setFlashId(null), 600);
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

        {/* Active props list */}
        <div>
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-3">
            ACTIVE PROPS ({props.length})
          </p>
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
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
                        onClick={() => resolve(prop.id, 'won')}
                        title="Mark as Won"
                        className="w-7 h-7 rounded-lg bg-primary-container/10 border border-primary-container/30 text-primary-container hover:bg-primary-container/20 flex items-center justify-center transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      </motion.button>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.88 }}
                        onClick={() => resolve(prop.id, 'lost')}
                        title="Mark as Lost"
                        className="w-7 h-7 rounded-lg bg-error/10 border border-error/30 text-error hover:bg-error/20 flex items-center justify-center transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
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
    </motion.div>
  );
}
