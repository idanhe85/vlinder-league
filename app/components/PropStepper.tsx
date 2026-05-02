'use client';

import { useEffect, useRef, useState } from 'react';

interface PropStepperProps {
  label: string;
  description?: string;
  min: number;
  max: number;
  step?: number;
  initialValue?: number;
  unit?: string;
  rangeHint?: string;
  reward?: string;
  onChange?: (v: number) => void;
}

/**
 * Horizontal ± stepper for large numeric Tournament Props (e.g. Total Goals).
 * Layout from prototype: [−]  [big number]  [+]
 *
 * Boundary behaviour:
 *   - The − button disables and dims when value === min
 *   - The + button disables and dims when value === max
 *   - Value display animates a brief colour flash on change
 */
export function PropStepper({
  label,
  description,
  min,
  max,
  step = 1,
  initialValue,
  unit = '',
  rangeHint,
  reward,
  onChange,
}: PropStepperProps) {
  const midpoint = Math.round((min + max) / 2 / step) * step;
  const [value, setValue] = useState(initialValue ?? midpoint);
  const [bumping, setBumping] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      setBumping(true);
      const id = setTimeout(() => setBumping(false), 220);
      prevValue.current = value;
      return () => clearTimeout(id);
    }
  }, [value]);

  function decrement() {
    if (value <= min) return;
    const next = Math.max(min, value - step);
    setValue(next);
    onChange?.(next);
  }

  function increment() {
    if (value >= max) return;
    const next = Math.min(max, value + step);
    setValue(next);
    onChange?.(next);
  }

  const canDecrement = value > min;
  const canIncrement = value < max;

  const btnBase =
    'w-12 h-12 rounded border flex items-center justify-center ' +
    'font-h3 text-xl leading-none select-none ' +
    'transition-all duration-150 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-1 focus-visible:ring-offset-background';
  const btnActive =
    'bg-surface-container border-white/10 text-primary ' +
    'hover:bg-primary-container/20 hover:border-primary-container/50 hover:text-primary-container ' +
    'active:scale-90';
  const btnDisabled =
    'bg-surface-container-lowest border-white/5 text-on-surface-variant/30 cursor-not-allowed';

  return (
    <div className="flex flex-col gap-4">
      {reward && (
        <span className="inline-block self-start bg-primary-container/10 text-primary-container font-label-caps text-label-caps px-3 py-1 rounded border border-primary-container/30">
          {reward}
        </span>
      )}

      <div>
        <p className="font-h3 text-h3 text-primary">{label}</p>
        {description && (
          <p className="text-on-surface-variant text-sm mt-1">{description}</p>
        )}
      </div>

      {/* ± control row */}
      <div className="flex items-center gap-4 mt-2" role="group" aria-label={label}>
        <button
          type="button"
          onClick={decrement}
          disabled={!canDecrement}
          aria-label={`Decrease ${label}`}
          className={`${btnBase} ${canDecrement ? btnActive : btnDisabled}`}
        >
          −
        </button>

        <div
          aria-live="polite"
          aria-atomic="true"
          className={[
            'flex-1 text-center py-4 rounded border',
            'bg-surface-container-highest border-white/5',
            'font-display-xl text-[2.5rem] leading-none text-primary-container tabular-nums',
            'transition-colors duration-200',
            bumping ? 'animate-score-bump' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {value}{unit}
        </div>

        <button
          type="button"
          onClick={increment}
          disabled={!canIncrement}
          aria-label={`Increase ${label}`}
          className={`${btnBase} ${canIncrement ? btnActive : btnDisabled}`}
        >
          +
        </button>
      </div>

      {rangeHint && (
        <p className="text-center font-label-caps text-label-caps text-on-surface-variant mt-1">
          {rangeHint}
        </p>
      )}
    </div>
  );
}
