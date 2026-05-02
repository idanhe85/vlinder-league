'use client';

import { useState } from 'react';
import { ScoreSpinner } from './ScoreSpinner';

interface Team {
  code: string;  // e.g. "ESP"
  flag?: string; // emoji flag e.g. "🇪🇸"
}

interface MatchScoreInputProps {
  home: Team;
  away: Team;
  /** When true: spinners are disabled, a LOCKED badge replaces the submit action */
  locked?: boolean;
  initialHome?: number | null;
  initialAway?: number | null;
  group?: string;
  kickoff?: string;
  onSave?: (home: number, away: number) => void;
}

/**
 * Full match prediction card — two ScoreSpinners joined by a colon,
 * with a locked/unlocked state that cascades down to both spinners.
 *
 * Locked visual treatment:
 *  - spinners dim to 50% opacity and all buttons are disabled
 *  - the action button is replaced by a green "LOCKED" badge
 *  - a subtle neon border replaces the default glass border
 */
export function MatchScoreInput({
  home,
  away,
  locked = false,
  initialHome = null,
  initialAway = null,
  group,
  kickoff,
  onSave,
}: MatchScoreInputProps) {
  const [homeScore, setHomeScore] = useState<number | null>(initialHome);
  const [awayScore, setAwayScore] = useState<number | null>(initialAway);

  const canSave = !locked && homeScore !== null && awayScore !== null;

  return (
    <div
      className={[
        'relative rounded-xl overflow-hidden',
        'backdrop-blur-xl border transition-colors duration-300',
        locked
          ? 'bg-surface-container/20 border-primary-container/20'
          : 'bg-surface-container/30 border-white/10 hover:border-white/20',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Subtle glass-edge highlight */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

      {/* Card header */}
      <div
        className={[
          'flex justify-between items-center px-5 py-2 border-b',
          locked
            ? 'bg-primary-container/10 border-primary-container/20'
            : 'bg-surface-container-high/60 border-white/5',
        ].join(' ')}
      >
        <span className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">
          {group ?? 'GROUP STAGE'}
        </span>
        {locked ? (
          <span className="flex items-center gap-1.5 font-label-caps text-label-caps text-primary-container">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M11 7V5a3 3 0 1 0-6 0v2H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1ZM6 5a2 2 0 1 1 4 0v2H6V5Zm2 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
            </svg>
            LOCKED
          </span>
        ) : (
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            {kickoff ?? 'UPCOMING'}
          </span>
        )}
      </div>

      {/* Score area */}
      <div className="flex items-center justify-between gap-4 px-6 py-6">
        {/* Home team */}
        <div className="flex flex-col items-center gap-2 flex-1">
          {home.flag && (
            <span className="text-3xl leading-none" role="img" aria-label={home.code}>
              {home.flag}
            </span>
          )}
          <span className="font-h3 text-body-lg text-primary tracking-wide">{home.code}</span>
          <ScoreSpinner
            value={homeScore}
            onChange={setHomeScore}
            locked={locked}
            teamLabel={home.code}
          />
        </div>

        {/* Colon separator */}
        <span
          className={`font-h3 text-h3 select-none transition-colors duration-300 ${
            locked ? 'text-on-surface-variant/40' : 'text-on-surface-variant/60'
          }`}
          aria-hidden="true"
        >
          :
        </span>

        {/* Away team */}
        <div className="flex flex-col items-center gap-2 flex-1">
          {away.flag && (
            <span className="text-3xl leading-none" role="img" aria-label={away.code}>
              {away.flag}
            </span>
          )}
          <span className="font-h3 text-body-lg text-primary tracking-wide">{away.code}</span>
          <ScoreSpinner
            value={awayScore}
            onChange={setAwayScore}
            locked={locked}
            teamLabel={away.code}
          />
        </div>
      </div>

      {/* Action footer */}
      <div className="px-5 pb-5">
        {locked ? (
          <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary-container/10 border border-primary-container/30 font-label-caps text-label-caps text-primary-container">
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M11 7V5a3 3 0 1 0-6 0v2H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1ZM6 5a2 2 0 1 1 4 0v2H6V5Zm2 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
            </svg>
            PREDICTION LOCKED
          </div>
        ) : (
          <button
            type="button"
            onClick={() => canSave && onSave?.(homeScore!, awayScore!)}
            disabled={!canSave}
            className={[
              'btn-surface w-full transition-all duration-200',
              canSave
                ? ''
                : 'opacity-40 cursor-not-allowed hover:bg-surface-container-highest hover:border-white/10',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            SAVE PREDICTION
          </button>
        )}
      </div>
    </div>
  );
}
