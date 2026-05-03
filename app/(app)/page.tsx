'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePredictions } from '@/app/context/PredictionContext';
import { useAuth } from '@/app/context/AuthContext';
import { AdminDashboard } from '@/app/components/AdminDashboard';
import { NumberTicker } from '@/app/components/NumberTicker';

export default function Home() {
  const { totalScore, rank, recentActivity, matchPredictions, propPredictions } = usePredictions();
  const { user } = useAuth();

  const isAdmin = user?.id === process.env.NEXT_PUBLIC_ADMIN_UUID;
  const [activeTab, setActiveTab] = useState<'dashboard' | 'admin'>('dashboard');

  const matchCount = Object.keys(matchPredictions).length;
  const propCount  = Object.keys(propPredictions).length;
  const totalPredictions = matchCount + propCount;

  return (
    <main className="min-h-screen bg-background px-5 py-10 max-w-[80rem] mx-auto">

      {/* ── Hero greeting ─────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="font-h1 text-h1 text-primary">Dashboard</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
          Vlinder League · World Cup 2026
        </p>
      </div>

      {/* ── Admin tab bar (only visible to admin) ─────────────────────── */}
      {isAdmin && (
        <div className="flex gap-1 mb-8 bg-surface-container/40 backdrop-blur border border-white/10 rounded-xl p-1 w-fit">
          {(['dashboard', 'admin'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={[
                'relative px-5 py-2 rounded-lg text-sm font-bold transition-colors duration-150 capitalize',
                activeTab === tab
                  ? 'text-background'
                  : 'text-on-surface-variant hover:text-on-surface',
              ].join(' ')}
            >
              {activeTab === tab && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-lg bg-primary-container"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">
                  {tab === 'dashboard' ? 'dashboard' : 'admin_panel_settings'}
                </span>
                {tab === 'dashboard' ? 'Dashboard' : 'Admin'}
              </span>
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'admin' ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <AdminDashboard />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >

      {/* ── Stats bar ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon="emoji_events"
          iconColor="text-primary-container"
          iconBg="bg-primary-container/10"
          label="Your Score"
          value={totalScore.toLocaleString()}
          tickerValue={totalScore}
          sub="pts"
        />
        <StatCard
          icon="leaderboard"
          iconColor="text-secondary"
          iconBg="bg-secondary/10"
          label="Current Rank"
          value={`#${rank}`}
          sub={rank === 1 ? 'Top of the table!' : `of ${12 + 1} players`}
        />
        <StatCard
          icon="sports_soccer"
          iconColor="text-tertiary-container"
          iconBg="bg-tertiary-container/10"
          label="Predictions Saved"
          value={String(totalPredictions)}
          sub={`${matchCount} match · ${propCount} prop`}
        />
      </div>

      {/* ── Recent Activity ───────────────────────────────────────────── */}
      {recentActivity.length > 0 && (
        <section className="mb-8">
          <div className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-h3 text-sm font-bold text-on-surface-variant uppercase tracking-wider">
                Recent Activity
              </h2>
              <span className="font-label-caps text-label-caps text-primary-container">
                +{recentActivity.reduce((s, a) => s + a.pointsEarned, 0)} pts this session
              </span>
            </div>
            <div className="divide-y divide-white/5">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={[
                        'material-symbols-outlined text-[18px]',
                        item.type === 'match' ? 'text-secondary' : 'text-tertiary-container',
                      ].join(' ')}
                    >
                      {item.type === 'match' ? 'sports_soccer' : 'military_tech'}
                    </span>
                    <span className="font-body-md text-on-surface">{item.label}</span>
                  </div>
                  <span className="font-label-caps text-label-caps text-primary-container">
                    +{item.pointsEarned} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Quick links ───────────────────────────────────────────────── */}
      <section>
        <h2 className="font-h3 text-h3 text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickLink
            href="/match-center"
            icon="sports_soccer"
            title="Predict Match Scores"
            description="Submit scoreline predictions for upcoming Round of 32 fixtures."
            accent="primary"
          />
          <QuickLink
            href="/props"
            icon="military_tech"
            title="Tournament Props"
            description="Lock in long-range predictions before the tournament starts."
            accent="secondary"
          />
          <QuickLink
            href="/leaderboard"
            icon="leaderboard"
            title="Leaderboard"
            description="See how you stack up against the rest of Vlinder League."
            accent="tertiary"
          />
          <QuickLink
            href="/insights"
            icon="analytics"
            title="Match Insights"
            description="Explore community predictions and match statistics."
            accent="primary"
          />
        </div>
      </section>

          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function StatCard({
  icon, iconColor, iconBg, label, value, sub, tickerValue,
}: {
  icon: string; iconColor: string; iconBg: string;
  label: string; value: string; sub: string;
  /** When provided, renders a NumberTicker instead of the static value string */
  tickerValue?: number;
}) {
  return (
    <div className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <span className={`material-symbols-outlined ${iconColor} text-[24px]`}>{icon}</span>
      </div>
      <div>
        <p className="font-label-caps text-label-caps text-on-surface-variant">{label}</p>
        <p className="font-h3 text-h3 text-primary tabular-nums leading-tight">
          {tickerValue !== undefined
            ? <NumberTicker value={tickerValue} />
            : value}
        </p>
        <p className="font-label-caps text-label-caps text-on-surface-variant/60 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

type Accent = 'primary' | 'secondary' | 'tertiary';

const ACCENT_ICON: Record<Accent, string> = {
  primary:  'text-primary-container',
  secondary:'text-secondary',
  tertiary: 'text-tertiary-container',
};
const ACCENT_BG: Record<Accent, string> = {
  primary:  'bg-primary-container/10 group-hover:bg-primary-container/15 border-primary-container/20',
  secondary:'bg-secondary/10 group-hover:bg-secondary/15 border-secondary/20',
  tertiary: 'bg-tertiary-container/10 group-hover:bg-tertiary-container/15 border-tertiary-container/20',
};

function QuickLink({
  href, icon, title, description, accent,
}: {
  href: string; icon: string; title: string; description: string; accent: Accent;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200 ${ACCENT_BG[accent]}`}
    >
      <span className={`material-symbols-outlined text-[28px] flex-shrink-0 mt-0.5 ${ACCENT_ICON[accent]}`}>
        {icon}
      </span>
      <div>
        <p className="font-h3 text-sm font-bold text-primary group-hover:text-primary transition-colors">{title}</p>
        <p className="font-body-md text-sm text-on-surface-variant mt-1">{description}</p>
      </div>
      <span className="material-symbols-outlined text-on-surface-variant/40 text-[20px] ml-auto flex-shrink-0 mt-0.5 group-hover:translate-x-1 transition-transform duration-200">
        chevron_right
      </span>
    </Link>
  );
}
