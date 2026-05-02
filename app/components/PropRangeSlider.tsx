'use client';

import { useState } from 'react';

interface PropRangeSliderProps {
  label: string;
  description?: string;
  min: number;
  max: number;
  step?: number;
  initialValue?: number;
  unit?: string;
  reward?: string;
  hint?: string;
  onChange?: (v: number) => void;
}

/**
 * Styled range slider for Tournament Props page.
 *
 * The filled-track effect uses a CSS custom property `--slider-fill`
 * (a percentage) injected as an inline style. This lets the `.prop-range`
 * CSS class in globals.css paint the filled portion with a linear-gradient
 * without any JS animation frame trickery — the browser transitions the
 * gradient automatically via the `transition` property on the track.
 *
 * Thumb behaviour (defined in globals.css):
 *   default  → 20×20 neon-green circle with 2px dark border
 *   hover    → scale(1.25) + green outer glow
 *   focus    → scale(1.25) + 3px focus ring + stronger glow
 *   active   → scale(0.95)
 */
export function PropRangeSlider({
  label,
  description,
  min,
  max,
  step = 1,
  initialValue,
  unit = '',
  reward,
  hint,
  onChange,
}: PropRangeSliderProps) {
  const [value, setValue] = useState(initialValue ?? Math.round((min + max) / 2));

  const fillPct = ((value - min) / (max - min)) * 100;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = Number(e.target.value);
    setValue(next);
    onChange?.(next);
  }

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

      {/* Slider + live value */}
      <div className="flex flex-col gap-3 mt-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${value}${unit}`}
          className="prop-range"
          // Inject fill % so the CSS gradient in globals.css can paint the track
          style={{ '--slider-fill': `${fillPct}%` } as React.CSSProperties}
        />

        {/* Min / current / max label row */}
        <div className="flex justify-between items-baseline font-label-caps text-label-caps">
          <span className="text-on-surface-variant">
            {min}{unit}
          </span>
          <span
            className="text-primary-container text-h3 font-h3 tabular-nums transition-all duration-150"
            aria-hidden="true"
          >
            {value}{unit}
          </span>
          <span className="text-on-surface-variant">
            {max}{unit}
          </span>
        </div>
      </div>

      {hint && (
        <div className="flex items-center gap-1.5 mt-1">
          <span className="material-symbols-outlined text-[14px] text-on-surface-variant/50">history</span>
          <p className="font-label-caps text-label-caps text-on-surface-variant/50">{hint}</p>
        </div>
      )}
    </div>
  );
}
