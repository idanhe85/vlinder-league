'use client';

import { useEffect, useState } from 'react';

const KICKOFF = new Date('2026-06-11T19:00:00Z').getTime();

function getTimeLeft() {
  const diff = KICKOFF - Date.now();
  if (diff <= 0) return null;
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <div className="relative w-full bg-surface-container-highest border border-white/10 rounded-xl px-2 py-2.5 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <span className="font-h1 text-[1.6rem] sm:text-[2.4rem] leading-none tabular-nums text-primary-container font-black">
          {String(value).padStart(2, '0')}
        </span>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-px bg-primary-container/60 blur-sm" />
      </div>
      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-[9px] sm:text-[10px]">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <span className="font-black text-[1.4rem] sm:text-[2rem] text-primary-container/40 leading-none mt-2.5 select-none flex-shrink-0">
      :
    </span>
  );
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!timeLeft) {
    return (
      <div className="bg-surface-container/60 backdrop-blur-xl border border-primary-container/30 rounded-2xl px-5 py-4 flex items-center gap-3 mb-8">
        <span className="material-symbols-outlined text-primary-container text-[22px]">sports_soccer</span>
        <span className="font-h3 text-h3 text-primary-container">The tournament has started!</span>
      </div>
    );
  }

  return (
    <div className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-primary-container text-[18px]">timer</span>
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
          Kickoff in
        </span>
        <span className="font-label-caps text-label-caps text-on-surface-variant/50 ml-auto text-[10px] sm:text-xs">
          11 Jun · 19:00 UTC
        </span>
      </div>

      <div className="flex items-start gap-1.5 sm:gap-3 w-full">
        <Unit value={timeLeft.days}    label="Days" />
        <Separator />
        <Unit value={timeLeft.hours}   label="Hours" />
        <Separator />
        <Unit value={timeLeft.minutes} label="Min" />
        <Separator />
        <Unit value={timeLeft.seconds} label="Sec" />
      </div>
    </div>
  );
}
