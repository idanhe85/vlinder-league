'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from './AuthContext';

// ── Types ──────────────────────────────────────────────────────────────────

export interface MatchPrediction {
  matchId: string;
  label: string;
  home: number;
  away: number;
  savedAt: string;
  pointsEarned: number;
}

export interface PropPrediction {
  propId: string;
  label: string;
  value: number | string;
  savedAt: string;
  pointsEarned: number;
}

export interface ActivityItem {
  id: string;
  type: 'match' | 'prop';
  label: string;
  pointsEarned: number;
  savedAt: string;
}

interface State {
  matchPredictions: Record<string, MatchPrediction>;
  propPredictions: Record<string, PropPrediction>;
}

type Action =
  | { type: 'SAVE_MATCH';  payload: MatchPrediction }
  | { type: 'SAVE_PROPS';  payload: PropPrediction[] }
  | { type: 'LOAD_MATCH';  payload: MatchPrediction[] }
  | { type: 'LOAD_PROPS';  payload: PropPrediction[] }
  | { type: 'RESET' };

// ── Scoring ────────────────────────────────────────────────────────────────

const MATCH_RESULTS: Record<string, { home: number; away: number }> = {};

const PTS_OUTCOME    = 30;
const PTS_EXACT      = 45;
const PTS_PROP       = 10;

function toOutcome(h: number, a: number) {
  return h > a ? 'home' : h < a ? 'away' : 'draw';
}

function calcMatchPoints(matchId: string, home: number, away: number): number {
  const result = MATCH_RESULTS[matchId];
  if (!result) return 0;
  if (result.home === home && result.away === away) return PTS_EXACT;
  if (toOutcome(home, away) === toOutcome(result.home, result.away)) return PTS_OUTCOME;
  return 0;
}

// ── Reducer ────────────────────────────────────────────────────────────────

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SAVE_MATCH':
    case 'LOAD_MATCH':
      if (action.type === 'LOAD_MATCH') {
        const loaded: Record<string, MatchPrediction> = {};
        action.payload.forEach((p) => { loaded[p.matchId] = p; });
        return { ...state, matchPredictions: loaded };
      }
      return {
        ...state,
        matchPredictions: {
          ...state.matchPredictions,
          [action.payload.matchId]: action.payload,
        },
      };
    case 'SAVE_PROPS':
    case 'LOAD_PROPS': {
      if (action.type === 'LOAD_PROPS') {
        const loaded: Record<string, PropPrediction> = {};
        action.payload.forEach((p) => { loaded[p.propId] = p; });
        return { ...state, propPredictions: loaded };
      }
      const next = { ...state.propPredictions };
      action.payload.forEach((p) => { next[p.propId] = p; });
      return { ...state, propPredictions: next };
    }
    case 'RESET':
      return { matchPredictions: {}, propPredictions: {} };
    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────

interface PredictionContextValue {
  matchPredictions: Record<string, MatchPrediction>;
  propPredictions: Record<string, PropPrediction>;
  totalScore: number;
  rank: number;
  totalPlayers: number;
  recentActivity: ActivityItem[];
  saveMatchPrediction: (matchId: string, label: string, home: number, away: number) => Promise<void>;
  savePropPredictions: (props: Array<{ propId: string; label: string; value: number | string }>) => Promise<void>;
}

const PredictionContext = createContext<PredictionContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────

export function PredictionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [state, dispatch] = useReducer(reducer, {
    matchPredictions: {},
    propPredictions: {},
  });

  const [rank, setRank]               = useState(1);
  const [totalPlayers, setTotalPlayers] = useState(0);

  // Load this user's predictions from Supabase whenever they log in / out
  useEffect(() => {
    if (!user) {
      dispatch({ type: 'RESET' });
      return;
    }

    const supabase = createClient();
    supabase
      .from('match_predictions')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) {
          dispatch({
            type: 'LOAD_MATCH',
            payload: data.map((r) => ({
              matchId:      r.match_id,
              label:        r.match_label,
              home:         r.home_score,
              away:         r.away_score,
              savedAt:      r.updated_at,
              pointsEarned: r.points_earned,
            })),
          });
        }
      });

    supabase
      .from('prop_predictions')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) {
          dispatch({
            type: 'LOAD_PROPS',
            payload: data.map((r) => ({
              propId:       r.prop_id,
              label:        r.prop_label,
              value:        r.value,
              savedAt:      r.updated_at,
              pointsEarned: r.points_earned,
            })),
          });
        }
      });
  }, [user?.id]);

  const totalScore = useMemo(() => {
    const matchPts = Object.values(state.matchPredictions).reduce((s, p) => s + p.pointsEarned, 0);
    const propPts  = Object.values(state.propPredictions).reduce((s, p) => s + p.pointsEarned, 0);
    return matchPts + propPts;
  }, [state]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from('leaderboard')
      .select('id, total_points')
      .order('total_points', { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        setTotalPlayers(data.length);
        const idx = data.findIndex((r) => r.id === user.id);
        setRank(idx >= 0 ? idx + 1 : data.length);
      });
  }, [user?.id, totalScore]);

  const recentActivity = useMemo((): ActivityItem[] => {
    const items: ActivityItem[] = [
      ...Object.values(state.matchPredictions).map((p) => ({
        id: `match-${p.matchId}`,
        type: 'match' as const,
        label: p.label,
        pointsEarned: p.pointsEarned,
        savedAt: p.savedAt,
      })),
      ...Object.values(state.propPredictions).map((p) => ({
        id: `prop-${p.propId}`,
        type: 'prop' as const,
        label: p.label,
        pointsEarned: p.pointsEarned,
        savedAt: p.savedAt,
      })),
    ];
    return items
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
      .slice(0, 5);
  }, [state]);

  const saveMatchPrediction = useCallback(
    async (matchId: string, label: string, home: number, away: number) => {
      const pointsEarned = calcMatchPoints(matchId, home, away);
      const savedAt      = new Date().toISOString();

      // Optimistic update
      dispatch({
        type: 'SAVE_MATCH',
        payload: { matchId, label, home, away, savedAt, pointsEarned },
      });

      if (user) {
        const { error } = await createClient().from('match_predictions').upsert(
          {
            user_id:       user.id,
            match_id:      matchId,
            match_label:   label,
            home_score:    home,
            away_score:    away,
            points_earned: 0, // scored later by admin via score_match()
            updated_at:    savedAt,
          },
          { onConflict: 'user_id,match_id' },
        );
        if (!error) {
          toast.success('Prediction Locked', {
            description: `${label} · ${home}–${away} · +${pointsEarned} pts`,
            icon: '🔒',
          });
        }
      } else {
        // Not persisted but still acknowledge the local save
        toast.success('Prediction Locked', {
          description: `${label} · ${home}–${away}`,
          icon: '🔒',
        });
      }
    },
    [user],
  );

  const savePropPredictions = useCallback(
    async (props: Array<{ propId: string; label: string; value: number | string }>) => {
      const savedAt = new Date().toISOString();
      const payload = props.map((p) => ({
        ...p,
        savedAt,
        pointsEarned: PTS_PROP,
      }));

      // Optimistic update
      dispatch({ type: 'SAVE_PROPS', payload });

      if (user) {
        const { error } = await createClient().from('prop_predictions').upsert(
          payload.map((p) => ({
            user_id:       user.id,
            prop_id:       p.propId,
            prop_label:    p.label,
            value:         String(p.value),
            points_earned: 0, // scored later by admin
            updated_at:    p.savedAt,
          })),
          { onConflict: 'user_id,prop_id' },
        );
        if (!error) {
          toast.success('Props Locked', {
            description: `${props.length} prediction${props.length !== 1 ? 's' : ''} saved · +${props.length * PTS_PROP} pts`,
            icon: '🏆',
          });
        }
      } else {
        toast.success('Props Locked', {
          description: `${props.length} prediction${props.length !== 1 ? 's' : ''} saved`,
          icon: '🏆',
        });
      }
    },
    [user],
  );

  const value = useMemo(
    () => ({
      matchPredictions: state.matchPredictions,
      propPredictions:  state.propPredictions,
      totalScore,
      rank,
      totalPlayers,
      recentActivity,
      saveMatchPrediction,
      savePropPredictions,
    }),
    [state, totalScore, rank, totalPlayers, recentActivity, saveMatchPrediction, savePropPredictions],
  );

  return (
    <PredictionContext.Provider value={value}>
      {children}
    </PredictionContext.Provider>
  );
}

export function usePredictions() {
  const ctx = useContext(PredictionContext);
  if (!ctx) throw new Error('usePredictions must be used within PredictionProvider');
  return ctx;
}
