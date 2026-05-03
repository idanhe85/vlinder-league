'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/app/context/AuthContext';
import { NumberTicker } from '@/app/components/NumberTicker';

interface ProfileData {
  username: string;
  display_name: string | null;
  total_points: number;
  predictions_made: number;
  props_made: number;
  rank: number;
}

interface Prediction {
  id: string;
  match_id: string;
  match_label: string;
  home_score: number;
  away_score: number;
  points_earned: number;
  created_at: string;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const supabase = createClient();

      // Fetch leaderboard entry + rank
      const { data: board } = await supabase
        .from('leaderboard')
        .select('*')
        .order('total_points', { ascending: false });

      if (board) {
        const idx = board.findIndex((r) => r.id === user!.id);
        const me  = board[idx];
        if (me) {
          setProfile({
            username:         me.username ?? 'player',
            display_name:     me.display_name,
            total_points:     Number(me.total_points),
            predictions_made: Number(me.predictions_made),
            props_made:       Number(me.props_made),
            rank:             idx + 1,
          });
        }
      }

      // Fetch recent predictions
      const { data: preds } = await supabase
        .from('match_predictions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setPredictions(preds ?? []);
      setLoading(false);
    }
    load();
  }, [user]);

  async function handleSignOut() {
    await signOut();
    router.push('/login');
    router.refresh();
  }

  const displayName = profile?.display_name || profile?.username || 'Player';
  const initials = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <main className="min-h-screen bg-background px-5 py-10 max-w-[80rem] mx-auto">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-6 relative overflow-hidden">
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
        />
        {/* Neon inner glow */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(195,244,0,0.05)]" />

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-surface-container-highest border-4 border-primary-container flex items-center justify-center shadow-[0_0_30px_rgba(195,244,0,0.2)]">
              <span className="font-h1 text-h1 text-primary-container">{loading ? '…' : initials}</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="w-48 h-8 bg-white/10 rounded mx-auto md:mx-0" />
                <div className="w-32 h-4 bg-white/10 rounded mx-auto md:mx-0" />
              </div>
            ) : (
              <>
                <h1 className="font-h1 text-h1 text-primary mb-1">{displayName}</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">
                  @{profile?.username}
                </p>

                {/* Stats row */}
                <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-10">
                  <Stat label="Total Points" value={<NumberTicker value={profile?.total_points ?? 0} />} accent />
                  <div className="w-px h-10 bg-white/10 hidden md:block mt-1" />
                  <Stat label="Global Rank" value={`#${profile?.rank ?? '—'}`} />
                  <div className="w-px h-10 bg-white/10 hidden md:block mt-1" />
                  <Stat label="Predictions" value={String(profile?.predictions_made ?? 0)} />
                  <div className="w-px h-10 bg-white/10 hidden md:block mt-1" />
                  <Stat label="Props" value={String(profile?.props_made ?? 0)} />
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Bento grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Stats card */}
        <section className="bg-surface-container/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
          <h2 className="font-h3 text-h3 text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[22px]">bar_chart</span>
            Activity
          </h2>

          <StatRow icon="sports_soccer"  label="Matches predicted" value={String(profile?.predictions_made ?? 0)} />
          <StatRow icon="military_tech"  label="Props submitted"   value={String(profile?.props_made ?? 0)} />
          <StatRow icon="emoji_events"   label="Points earned"     value={String(profile?.total_points ?? 0)} accent />

          <div className="mt-auto pt-4 border-t border-white/5">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-error/70 hover:text-error font-label-caps text-label-caps uppercase tracking-wider transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign out
            </button>
          </div>
        </section>

        {/* Prediction history */}
        <section className="lg:col-span-2 bg-surface-container/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col">
          <h2 className="font-h3 text-h3 text-primary flex items-center gap-2 mb-5 pb-4 border-b border-white/5">
            <span className="material-symbols-outlined text-primary-container text-[22px]">history</span>
            Prediction History
          </h2>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-lg" />
              ))}
            </div>
          ) : predictions.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-16 gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px]">sports_soccer</span>
              <p className="font-body-lg text-body-lg">No predictions yet.</p>
              <a href="/match-center" className="font-label-caps text-label-caps text-primary-container uppercase tracking-wider hover:opacity-80 transition-opacity">
                Go to Match Center →
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {predictions.map((p) => (
                <PredictionRow key={p.id} prediction={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function Stat({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="text-center md:text-left">
      <p className="font-label-caps text-label-caps text-outline uppercase mb-1">{label}</p>
      <p className={`font-h2 text-[2rem] font-extrabold tracking-tighter leading-none ${accent ? 'text-primary-container' : 'text-primary'}`}>
        {value}
      </p>
    </div>
  );
}

function StatRow({ icon, label, value, accent }: { icon: string; label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
        <span className="font-body-md text-body-md">{label}</span>
      </div>
      <span className={`font-h3 text-h3 tabular-nums ${accent ? 'text-primary-container' : 'text-primary'}`}>
        {value}
      </span>
    </div>
  );
}

function PredictionRow({ prediction }: { prediction: Prediction }) {
  const pts = prediction.points_earned;
  const hasResult = pts > 0;

  const badgeClass = pts >= 10
    ? 'bg-primary-container/10 border-primary-container/30 text-primary-container'
    : pts > 0
    ? 'bg-secondary-container/10 border-secondary/30 text-secondary'
    : 'bg-white/5 border-white/10 text-on-surface-variant';

  const badgeLabel = pts >= 10 ? 'Exact' : pts > 0 ? 'Result' : 'Pending';

  const date = new Date(prediction.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short',
  });

  return (
    <div className="bg-surface-container-low/50 border border-white/5 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4 hover:bg-surface-container-highest transition-colors">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        {/* Badge */}
        <div className={`flex flex-col items-center justify-center w-14 h-14 rounded border shrink-0 ${badgeClass}`}>
          <span className="font-label-caps text-[9px] uppercase">{badgeLabel}</span>
          <span className="font-h3 text-h3 leading-none mt-0.5">+{pts}</span>
        </div>
        {/* Match info */}
        <div>
          <p className="font-label-caps text-[10px] text-outline mb-1 uppercase">{date}</p>
          <p className="font-body-md font-semibold text-primary">{prediction.match_label}</p>
          <p className="font-label-caps text-label-caps text-on-surface-variant mt-0.5">
            Pick: <span className="text-primary-container font-bold">{prediction.home_score} – {prediction.away_score}</span>
          </p>
        </div>
      </div>
      {hasResult && (
        <div className="text-right shrink-0">
          <p className="font-label-caps text-[10px] text-outline uppercase mb-1">Points</p>
          <p className="font-h3 text-h3 text-primary-container">+{pts}</p>
        </div>
      )}
    </div>
  );
}
