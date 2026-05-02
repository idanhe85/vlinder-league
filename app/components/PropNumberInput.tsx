'use client';

import { useState } from 'react';

interface PropNumberInputProps {
  label: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  initialValue?: number;
  unit?: string;
  rangeHint?: string;
  reward?: string;
  onChange?: (v: number) => void;
}

/**
 * Free-type number input for Tournament Props.
 * Replaces the ± stepper when direct numeric entry is preferred.
 * Clamps the committed value to [min, max] on blur.
 */
export function PropNumberInput({
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
}: PropNumberInputProps) {
  const [value, setValue] = useState<number | ''>(initialValue ?? '');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === '') {
      setValue('');
      return;
    }
    const num = Number(raw);
    setValue(num);
    onChange?.(num);
  }

  function handleBlur() {
    if (value === '') return;
    let clamped = Number(value);
    if (min !== undefined) clamped = Math.max(min, clamped);
    if (max !== undefined) clamped = Math.min(max, clamped);
    setValue(clamped);
    onChange?.(clamped);
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

      <div className="flex flex-col gap-2 mt-2">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-label={label}
          placeholder={
            min !== undefined && max !== undefined
              ? `${min} – ${max}`
              : 'Enter a number'
          }
          className="input-score"
        />
        {rangeHint && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant/50">history</span>
            <p className="font-label-caps text-label-caps text-on-surface-variant/50">{rangeHint}</p>
          </div>
        )}
      </div>
    </div>
  );
}
