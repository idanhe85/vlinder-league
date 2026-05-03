export default function InsightsPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-10 max-w-[80rem] mx-auto">

      {/* ── Match hero card ───────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 mb-8">
        {/* Stadium photo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/insights_background.jpg)' }}
          aria-hidden="true"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-background/75 backdrop-blur-[1px]" aria-hidden="true" />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #111417 20%, transparent 100%)' }}
          aria-hidden="true"
        />

        <div className="relative px-6 py-8 sm:px-10">
          {/* Badges row */}
          <div className="flex items-center gap-3 mb-6">
            <span className="font-label-caps text-label-caps bg-primary-container text-on-primary-container px-3 py-1 rounded">
              GROUP STAGE
            </span>
            <div className="flex items-center gap-1.5 text-on-surface-variant text-sm">
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
              <span>Jun 18, 2026 · 21:00 GMT</span>
            </div>
          </div>

          {/* Teams */}
          <div className="flex items-center justify-center gap-6 sm:gap-16">
            <TeamHero name="Brazil" code="BRA" color="#facc15" />
            <div className="text-center flex-shrink-0">
              <p className="font-display-xl text-[3rem] italic text-primary-container font-black leading-none">VS</p>
              <div className="flex items-center gap-1.5 text-on-surface-variant text-sm mt-2">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                <span>Maracanã Stadium</span>
              </div>
            </div>
            <TeamHero name="Germany" code="GER" color="#94a3b8" />
          </div>
        </div>
      </div>

      {/* ── Bento grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Community Predictions */}
          <div className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            {/* Decorative pie chart icon */}
            <span
              className="material-symbols-outlined absolute top-4 right-4 text-[80px] text-on-surface-variant opacity-5 pointer-events-none"
              aria-hidden="true"
            >
              pie_chart
            </span>
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-secondary text-[20px]">trending_up</span>
              <h2 className="font-h3 text-h3 text-primary">Community Predictions</h2>
            </div>

            <div className="flex flex-col gap-4">
              {COMMUNITY_PREDICTIONS.map((pred) => (
                <ProbabilityBar key={pred.label} {...pred} />
              ))}
            </div>
          </div>

          {/* Top Scorelines */}
          <div className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-secondary text-[20px]">sports_score</span>
              <h2 className="font-h3 text-h3 text-primary">Top Scorelines</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SCORELINES.map((s, i) => (
                <ScorelineCard key={s.score} score={s.score} pct={s.pct} primary={i === 0} />
              ))}
            </div>
          </div>
        </div>

        {/* Right column (1/3 width) */}
        <div className="flex flex-col gap-6">

          {/* Your Prediction */}
          <div className="bg-surface-container/60 backdrop-blur-xl border border-t-2 border-white/10 border-t-primary-container rounded-2xl p-6 relative overflow-hidden shadow-[inset_0_0_30px_rgba(195,244,0,0.04)]">
            {/* Boosted badge */}
            <div className="absolute top-4 right-4 bg-surface-container-highest px-2 py-1 rounded">
              <span className="font-label-caps text-[10px] text-tertiary-container uppercase tracking-wider">
                Boosted Odds Applied
              </span>
            </div>

            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-primary-container text-[20px]">edit_note</span>
              <h2 className="font-h3 text-h3 text-primary">Your Prediction</h2>
            </div>

            {/* Selected outcome */}
            <div className="flex flex-col items-center gap-4 py-4">
              <span className="font-label-caps text-label-caps text-on-surface-variant">SELECTED OUTCOME</span>
              <div className="outcome-pill">Brazil Win</div>

              {/* Score boxes */}
              <div className="flex items-center gap-3 mt-2">
                <ScoreBox value={2} />
                <span className="font-h3 text-h3 text-on-surface-variant">:</span>
                <ScoreBox value={1} />
              </div>

              <p className="text-sm text-on-surface-variant text-center mt-1">
                Prediction locked in 2 hours ago.
              </p>
            </div>

            <button type="button" className="btn-secondary w-full mt-2">
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Prediction
            </button>
          </div>

          {/* Quick stats */}
          <div className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="font-h3 text-h3 text-primary mb-4">Match Stats</h2>
            <div className="flex flex-col gap-3">
              {MATCH_STATS.map((stat) => (
                <StatRow key={stat.label} {...stat} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

// TLA → ISO 3166-1 alpha-2 for flagcdn.com
const TLA_TO_ISO: Record<string, string> = {
  BRA: 'br', GER: 'de', ARG: 'ar', FRA: 'fr', ENG: 'gb-eng',
  ESP: 'es', ITA: 'it', POR: 'pt', NED: 'nl', BEL: 'be',
  URU: 'uy', MEX: 'mx', USA: 'us', CRO: 'hr', SEN: 'sn',
  MAR: 'ma', JPN: 'jp', KOR: 'kr', AUS: 'au', RSA: 'za',
  CMR: 'cm', GHA: 'gh', NGR: 'ng', EGY: 'eg', TUN: 'tn',
  CAN: 'ca', CHI: 'cl', COL: 'co', ECU: 'ec', PAR: 'py',
  PER: 'pe', VEN: 've', POL: 'pl', SUI: 'ch', DEN: 'dk',
  SWE: 'se', NOR: 'no', AUT: 'at', SCO: 'gb-sct',
  WAL: 'gb-wls', IRL: 'ie', TUR: 'tr', GRE: 'gr', UKR: 'ua',
  SRB: 'rs', SVK: 'sk', CZE: 'cz', HUN: 'hu', ROU: 'ro',
  IRN: 'ir', SAU: 'sa', QAT: 'qa', UAE: 'ae', JOR: 'jo',
};

function TeamHero({ name, code, color }: { name: string; code: string; color: string }) {
  const isoCode = TLA_TO_ISO[code];
  const flagUrl = isoCode ? `https://flagcdn.com/w80/${isoCode}.png` : null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 flex items-center justify-center overflow-hidden"
        style={{ borderColor: color + '60', backgroundColor: color + '15', boxShadow: `0 0 20px ${color}30` }}
      >
        {flagUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={flagUrl}
            alt={name}
            className="w-10 h-auto sm:w-12 object-contain rounded-sm"
          />
        ) : (
          <span className="font-label-caps text-sm font-bold" style={{ color }}>{code}</span>
        )}
      </div>
      <p className="font-h3 text-h3 text-primary">{name}</p>
    </div>
  );
}

function ProbabilityBar({
  label, pct, gradient, pulse,
}: { label: string; pct: number; gradient: string; pulse?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="font-body-md text-on-surface">{label}</span>
        <span className="font-h3 text-sm font-bold text-primary-container tabular-nums">{pct}%</span>
      </div>
      <div className="h-3 rounded-full bg-surface-container-highest border border-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full relative ${pulse ? 'overflow-hidden' : ''}`}
          style={{ width: `${pct}%`, background: gradient }}
        >
          {pulse && (
            <div className="absolute inset-0 animate-pulse bg-white/20 rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
}

function ScorelineCard({ score, pct, primary }: { score: string; pct: number; primary?: boolean }) {
  return (
    <div className="bg-surface-container-high border border-white/5 rounded-xl p-4 text-center border-t-2 border-t-primary-container/40">
      <p className={`font-h2 text-h2 tracking-widest ${primary ? 'text-primary' : 'text-on-surface-variant'}`}>
        {score}
      </p>
      <p className={`font-label-caps text-label-caps mt-1 ${primary ? 'text-primary-container' : 'text-on-surface-variant/60'}`}>
        {pct}% PREDICT
      </p>
    </div>
  );
}

function ScoreBox({ value }: { value: number }) {
  return (
    <div className="w-16 h-20 bg-surface-container-highest border border-white/10 rounded-lg flex items-center justify-center">
      <span className="font-display-xl text-[2.5rem] text-primary leading-none">{value}</span>
    </div>
  );
}

function StatRow({ label, home, away }: { label: string; home: string; away: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-primary font-semibold w-8 text-right tabular-nums">{home}</span>
      <span className="flex-1 text-center font-label-caps text-label-caps text-on-surface-variant">{label}</span>
      <span className="text-on-surface-variant font-semibold w-8 text-left tabular-nums">{away}</span>
    </div>
  );
}

/* ── Static data ─────────────────────────────────────────────────────────── */

const COMMUNITY_PREDICTIONS = [
  { label: 'Brazil Win', pct: 55, gradient: 'linear-gradient(to right, #0266ff, #b3c5ff)', pulse: true },
  { label: 'Draw',       pct: 20, gradient: 'linear-gradient(to right, #4b5563, #9ca3af)' },
  { label: 'Germany Win', pct: 25, gradient: 'linear-gradient(to right, #ffb4ab, #93000a)' },
];

const SCORELINES = [
  { score: '2–1', pct: 40 },
  { score: '1–1', pct: 18 },
  { score: '3–1', pct: 12 },
  { score: '0–2', pct: 8 },
];

const MATCH_STATS = [
  { label: 'Avg Goals', home: '2.4', away: '1.8' },
  { label: 'Clean Sheets', home: '4', away: '3' },
  { label: 'Form (last 5)', home: '4W', away: '3W' },
  { label: 'Head to Head', home: '8W', away: '5W' },
];
