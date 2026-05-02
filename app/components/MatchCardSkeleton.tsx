/**
 * MatchCardSkeleton
 *
 * Pixel-matched to FixtureCard's internal layout:
 *   - p-4 card padding
 *   - Row 1: date pill (left) + group badge (right)         — mb-4
 *   - Row 2: [crest circle + name + score] VS [score + name + crest]  — mb-4
 *   - Row 3: prediction zone (border-t pt-4) with two score inputs + Save btn
 *
 * All shimmer blocks use bg-white/10 animate-pulse on a dark card surface.
 */
export function MatchCardSkeleton() {
  return (
    <div className="bg-surface-container/60 backdrop-blur-xl border border-white/10 border-l-4 border-l-white/10 rounded-xl overflow-hidden">
      <div className="p-4 animate-pulse">

        {/* ── Row 1: date · time  /  Group badge ───────────────────── */}
        <div className="flex items-center justify-between mb-4">
          {/* calendar icon + date text */}
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-white/10" />
            <div className="w-32 h-3.5 rounded-full bg-white/10" />
          </div>
          {/* group badge */}
          <div className="w-16 h-5 rounded bg-white/10" />
        </div>

        {/* ── Row 2: home team — VS — away team ────────────────────── */}
        <div className="flex items-center justify-between gap-4 mb-4">

          {/* Home: crest + name/score stacked */}
          <div className="flex items-center gap-3 flex-1">
            {/* crest circle */}
            <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0" />
            <div className="flex flex-col gap-1.5">
              {/* TLA */}
              <div className="w-10 h-3.5 rounded-full bg-white/10" />
              {/* score dash */}
              <div className="w-5 h-5 rounded bg-white/10" />
            </div>
          </div>

          {/* VS label */}
          <div className="w-6 h-3.5 rounded-full bg-white/10 flex-shrink-0" />

          {/* Away: reversed */}
          <div className="flex items-center gap-3 flex-1 flex-row-reverse">
            <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0" />
            <div className="flex flex-col items-end gap-1.5">
              <div className="w-10 h-3.5 rounded-full bg-white/10" />
              <div className="w-5 h-5 rounded bg-white/10" />
            </div>
          </div>
        </div>

        {/* ── Row 3: prediction zone ────────────────────────────────── */}
        <div className="border-t border-white/5 pt-4 mt-2 flex items-center gap-3">
          {/* home label */}
          <div className="flex-1 flex justify-end">
            <div className="w-8 h-3 rounded-full bg-white/10" />
          </div>
          {/* score inputs */}
          <div className="flex items-center gap-2">
            <div className="w-14 h-12 rounded-lg bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-14 h-12 rounded-lg bg-white/10" />
          </div>
          {/* away label */}
          <div className="flex-1">
            <div className="w-8 h-3 rounded-full bg-white/10" />
          </div>
          {/* save button */}
          <div className="w-14 h-9 rounded-lg bg-white/10" />
        </div>

      </div>
    </div>
  );
}
