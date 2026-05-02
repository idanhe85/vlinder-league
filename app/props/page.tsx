'use client';

import { useState } from 'react';
import { usePredictions } from '@/app/context/PredictionContext';
import { PropNumberInput } from '@/app/components/PropNumberInput';
import { PropRangeSlider } from '@/app/components/PropRangeSlider';
import { PlayerSearch } from '@/app/components/PlayerSearch';
import { MotionButton } from '@/app/components/MotionButton';

export default function PropsPage() {
  const { savePropPredictions, propPredictions } = usePredictions();

  // Lifted prop values — components report changes via onChange
  const [totalGoals,      setTotalGoals]      = useState(165);
  const [totalRedCards,   setTotalRedCards]   = useState(22);
  const [totalYellowCards,setTotalYellowCards]= useState(50);
  const [goldenBoot,      setGoldenBoot]      = useState(7);
  const [winner,          setWinner]          = useState('');
  const [goldenBall,      setGoldenBall]      = useState('K. Mbappé');

  const [saveFlash,       setSaveFlash]       = useState(false);

  const totalSaved = Object.keys(propPredictions).length;

  function handleSave() {
    const props = [
      { propId: 'totalGoals',       label: 'Total Tournament Goals', value: totalGoals       },
      { propId: 'totalRedCards',    label: 'Total Red Cards',         value: totalRedCards    },
      { propId: 'totalYellowCards', label: 'Total Yellow Cards',      value: totalYellowCards },
      { propId: 'goldenBoot',       label: 'Golden Boot Goals',       value: goldenBoot       },
      ...(winner    ? [{ propId: 'winner',    label: 'Tournament Winner', value: ALL_TEAMS.find((t) => t.code === winner)?.name ?? winner }] : []),
      ...(goldenBall ? [{ propId: 'goldenBall', label: 'Golden Ball',     value: goldenBall }] : []),
    ];
    savePropPredictions(props);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 3000);
  }

  return (
    <main className="min-h-screen bg-background px-5 py-10 max-w-[80rem] mx-auto">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative mb-10 overflow-hidden rounded-2xl p-8 bg-surface-container/40 border border-white/10">
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(195,244,0,0.12) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
          aria-hidden="true"
        />
        <span className="font-label-caps text-label-caps text-primary-container mb-2 block">
          SELECTIONS CLOSE AT TOURNAMENT KICKOFF
        </span>
        <h1 className="font-h1 text-h1 text-primary uppercase italic tracking-tight">
          Tournament Props
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 whitespace-nowrap">
          Lock in your long-range predictions. High risk, high reward.
        </p>
        {totalSaved > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 bg-primary-container/10 border border-primary-container/30 rounded-lg px-3 py-1.5">
            <span className="material-symbols-outlined text-primary-container text-[16px]">check_circle</span>
            <span className="font-label-caps text-label-caps text-primary-container">
              {totalSaved} prop{totalSaved !== 1 ? 's' : ''} saved · +{totalSaved * 10} pts earned
            </span>
          </div>
        )}
      </div>

      {/* ── Tournament Winner ─────────────────────────────────────────── */}
      <section className="mb-6">
        <div className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,224,136,0.15) 0%, transparent 70%)', transform: 'translate(20%, -20%)' }}
            aria-hidden="true"
          />
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="inline-block bg-tertiary-container/20 text-tertiary-container font-label-caps text-label-caps px-3 py-1 rounded border border-tertiary-container/30 mb-3">
                20 PTS REWARD
              </span>
              <h2 className="font-h3 text-h3 text-primary">Tournament Winner</h2>
              <p className="text-on-surface-variant text-sm mt-1">Select the outright winner of the 2026 World Cup.</p>
            </div>
            <span className="material-symbols-outlined text-[48px] text-tertiary-container opacity-60">emoji_events</span>
          </div>
          <div className="relative">
            {/* Flag of selected team overlaid on the left */}
            {winner && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none z-10">
                {ALL_TEAMS.find((t) => t.code === winner)?.flag}
              </span>
            )}
            <select
              value={winner}
              onChange={(e) => setWinner(e.target.value)}
              className={[
                'w-full appearance-none bg-surface-container-highest border border-white/20 rounded-xl',
                'py-3 pr-10 text-sm font-semibold text-primary',
                'focus:outline-none focus:border-tertiary-container focus:shadow-[0_0_0_2px_rgba(255,224,136,0.2)]',
                'transition-all duration-150 cursor-pointer',
                winner ? 'pl-10' : 'pl-4',
              ].join(' ')}
            >
              <option value="" className="bg-[#1e2226] text-on-surface-variant">
                — Select a team —
              </option>
              {ALL_TEAMS.map((t) => (
                <option key={t.code} value={t.code} className="bg-[#1e2226] text-on-surface">
                  {t.flag} {t.name}
                </option>
              ))}
            </select>
            {/* Chevron icon */}
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
              expand_more
            </span>
          </div>
        </div>
      </section>

      {/* ── Bento grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        {/* Golden Ball */}
        <div className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <span className="inline-block bg-secondary/10 text-secondary font-label-caps text-label-caps px-3 py-1 rounded border border-secondary/30 mb-3">
            15 PTS REWARD
          </span>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-h3 text-h3 text-primary">Golden Ball</h2>
              <p className="text-on-surface-variant text-sm mt-1">Best overall player of the tournament.</p>
            </div>
            <span className="material-symbols-outlined text-[36px] text-secondary opacity-60">star</span>
          </div>
          <PlayerSearch value={goldenBall} onChange={setGoldenBall} />
        </div>

        {/* Total Tournament Goals */}
        <div className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <PropNumberInput
            label="Total Tournament Goals"
            description="Predict total goals scored across the tournament."
            min={0}
            max={999}
            step={1}
            initialValue={totalGoals}
            rangeHint="Avg. last 4 WCs: 164 goals"
            reward="10 PTS REWARD"
            onChange={setTotalGoals}
          />
        </div>

        {/* Total Red Cards */}
        <div className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <PropRangeSlider
            label="Total Red Cards"
            description="Exact number of red cards issued."
            min={0}
            max={100}
            step={1}
            initialValue={totalRedCards}
            reward="10 PTS REWARD"
            hint="Avg. last 4 WCs: 9 red cards"
            onChange={setTotalRedCards}
          />
        </div>

        {/* Total Yellow Cards */}
        <div className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <PropRangeSlider
            label="Total Yellow Cards"
            description="Total bookings across the tournament."
            min={0}
            max={100}
            step={1}
            initialValue={totalYellowCards}
            reward="8 PTS REWARD"
            hint="Avg. last 4 WCs: 220 yellow cards"
            onChange={setTotalYellowCards}
          />
        </div>

        {/* Golden Boot */}
        <div className="bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:col-span-2">
          <PropRangeSlider
            label="Golden Boot Goals"
            description="Goals scored by the tournament top scorer."
            min={3}
            max={12}
            step={1}
            initialValue={goldenBoot}
            reward="15 PTS REWARD"
            onChange={setGoldenBoot}
          />
        </div>
      </div>

      {/* ── Save CTA ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-4">
        {saveFlash && (
          <div className="flex items-center gap-2 text-primary-container">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span className="font-label-caps text-label-caps">Predictions saved! +{(4 + (winner ? 1 : 0) + (goldenBall ? 1 : 0)) * 10} pts</span>
          </div>
        )}
        <MotionButton type="button" onClick={handleSave} className="px-10">
          Save Predictions
        </MotionButton>
      </div>
    </main>
  );
}

/* ── WinnerOption ─────────────────────────────────────────────────────────── */


/* ── Static data — all 48 WC 2026 qualified teams ───────────────────────── */

const ALL_TEAMS = [
  { flag: '🇩🇿', name: 'Algeria',            code: 'ALG' },
  { flag: '🇦🇷', name: 'Argentina',          code: 'ARG' },
  { flag: '🇦🇺', name: 'Australia',          code: 'AUS' },
  { flag: '🇦🇹', name: 'Austria',            code: 'AUT' },
  { flag: '🇧🇪', name: 'Belgium',            code: 'BEL' },
  { flag: '🇧🇦', name: 'Bosnia-Herzegovina', code: 'BIH' },
  { flag: '🇧🇷', name: 'Brazil',             code: 'BRA' },
  { flag: '🇨🇦', name: 'Canada',             code: 'CAN' },
  { flag: '🇨🇻', name: 'Cape Verde',         code: 'CPV' },
  { flag: '🇨🇴', name: 'Colombia',           code: 'COL' },
  { flag: '🇨🇩', name: 'Congo DR',           code: 'COD' },
  { flag: '🇭🇷', name: 'Croatia',            code: 'CRO' },
  { flag: '🇨🇼', name: 'Curaçao',            code: 'CUR' },
  { flag: '🇨🇿', name: 'Czechia',            code: 'CZE' },
  { flag: '🇪🇨', name: 'Ecuador',            code: 'ECU' },
  { flag: '🇪🇬', name: 'Egypt',              code: 'EGY' },
  { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England',           code: 'ENG' },
  { flag: '🇫🇷', name: 'France',             code: 'FRA' },
  { flag: '🇩🇪', name: 'Germany',            code: 'GER' },
  { flag: '🇬🇭', name: 'Ghana',              code: 'GHA' },
  { flag: '🇭🇹', name: 'Haiti',              code: 'HAI' },
  { flag: '🇮🇷', name: 'Iran',               code: 'IRN' },
  { flag: '🇮🇶', name: 'Iraq',               code: 'IRQ' },
  { flag: '🇨🇮', name: 'Ivory Coast',        code: 'CIV' },
  { flag: '🇯🇵', name: 'Japan',              code: 'JPN' },
  { flag: '🇯🇴', name: 'Jordan',             code: 'JOR' },
  { flag: '🇲🇽', name: 'Mexico',             code: 'MEX' },
  { flag: '🇲🇦', name: 'Morocco',            code: 'MAR' },
  { flag: '🇳🇱', name: 'Netherlands',        code: 'NED' },
  { flag: '🇳🇿', name: 'New Zealand',        code: 'NZL' },
  { flag: '🇳🇴', name: 'Norway',             code: 'NOR' },
  { flag: '🇵🇦', name: 'Panama',             code: 'PAN' },
  { flag: '🇵🇾', name: 'Paraguay',           code: 'PAR' },
  { flag: '🇵🇹', name: 'Portugal',           code: 'POR' },
  { flag: '🇶🇦', name: 'Qatar',              code: 'QAT' },
  { flag: '🇸🇦', name: 'Saudi Arabia',       code: 'KSA' },
  { flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', name: 'Scotland',           code: 'SCO' },
  { flag: '🇸🇳', name: 'Senegal',            code: 'SEN' },
  { flag: '🇿🇦', name: 'South Africa',       code: 'RSA' },
  { flag: '🇰🇷', name: 'South Korea',        code: 'KOR' },
  { flag: '🇪🇸', name: 'Spain',              code: 'ESP' },
  { flag: '🇸🇪', name: 'Sweden',             code: 'SWE' },
  { flag: '🇨🇭', name: 'Switzerland',        code: 'SUI' },
  { flag: '🇹🇳', name: 'Tunisia',            code: 'TUN' },
  { flag: '🇹🇷', name: 'Turkey',             code: 'TUR' },
  { flag: '🇺🇸', name: 'United States',      code: 'USA' },
  { flag: '🇺🇾', name: 'Uruguay',            code: 'URU' },
  { flag: '🇺🇿', name: 'Uzbekistan',         code: 'UZB' },
];
