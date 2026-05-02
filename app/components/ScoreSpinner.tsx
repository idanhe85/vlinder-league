'use client';

import { useEffect, useRef, useState } from 'react';

interface ScoreSpinnerProps {
  value: number | null;
  onChange: (v: number) => void;
  /** Disables all interaction; renders locked visual treatment */
  locked?: boolean;
  min?: number;
  max?: number;
  /** Accessible name of the team this spinner belongs to */
  teamLabel: string;
}

/**
 * Vertical score spinner (+ on top, value in middle, − on bottom).
 * Used in match prediction cards. Pair two of these with a ":" separator
 * via MatchScoreInput.
 */
export function ScoreSpinner({
  value,
  onChange,
  locked = false,
  min = 0,
  max = 9,
  teamLabel,
}: ScoreSpinnerProps) {
  const [bumping, setBumping] = useState(false);
  const prevValue = useRef(value);

  // Trigger the pop animation whenever the value changes
  useEffect(() => {
    if (prevValue.current !== value && value !== null) {
      setBumping(true);
      const id = setTimeout(() => setBumping(false), 220);
      prevValue.current = value;
      return () => clearTimeout(id);
    }
  }, [value]);

  const canDecrement = !locked && value !== null && value > min;
  const canIncrement = !locked && (value === null || value < max);

  function handleIncrement() {
    if (!canIncrement) return;
    onChange(value === null ? 0 : value + 1);
  }

  function handleDecrement() {
    if (!canDecrement) return;
    onChange(value! - 1);
  }

  // Shared button base classes
  const btnBase =
    'w-8 h-8 rounded border flex items-center justify-center text-lg leading-none select-none ' +
    'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-1 focus-visible:ring-offset-background';
  const btnActive =
    'bg-surface-container-high border-white/10 text-primary ' +
    'hover:bg-primary-container/20 hover:border-primary-container/50 active:scale-90';
  const btnDisabled =
    'bg-surface-container-lowest border-white/5 text-on-surface-variant cursor-not-allowed opacity-40';

  return (
    <div
      className={`flex flex-col items-center gap-1 transition-opacity duration-300 ${locked ? 'opacity-50' : ''}`}
      role="group"
      aria-label={`${teamLabel} score`}
    >
      {/* Increment */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={!canIncrement}
        aria-label={`Increase ${teamLabel} score`}
        className={`${btnBase} ${canIncrement ? btnActive : btnDisabled}`}
      >
        +
      </button>

      {/* Value display */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className={[
          'w-16 h-16 flex items-center justify-center rounded-lg border',
          'font-display-xl text-h2 tabular-nums',
          'transition-colors duration-200',
          locked
            ? 'bg-surface-container-lowest border-white/5 text-on-surface-variant'
            : 'bg-surface-container-highest border-white/20 text-primary',
          bumping ? 'animate-score-bump' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {value !== null ? value : '–'}
      </div>

      {/* Decrement */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={!canDecrement}
        aria-label={`Decrease ${teamLabel} score`}
        className={`${btnBase} ${canDecrement ? btnActive : btnDisabled}`}
      >
        −
      </button>
    </div>
  );
}
