'use client';

import { useState, useRef, useEffect } from 'react';

interface Player {
  name: string;
  team: string;
  flag: string;
}

const PLAYERS: Player[] = [
  { name: 'K. Mbappé',       team: 'France',    flag: '🇫🇷' },
  { name: 'Vinicius Jr.',    team: 'Brazil',    flag: '🇧🇷' },
  { name: 'L. Messi',        team: 'Argentina', flag: '🇦🇷' },
  { name: 'J. Bellingham',   team: 'England',   flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'E. Haaland',      team: 'Norway',    flag: '🇳🇴' },
  { name: 'R. Lewandowski',  team: 'Poland',    flag: '🇵🇱' },
  { name: 'H. Kane',         team: 'England',   flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'P. Foden',        team: 'England',   flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'R. Yamal',        team: 'Spain',     flag: '🇪🇸' },
  { name: 'F. Ruiz',         team: 'Spain',     flag: '🇪🇸' },
  { name: 'A. Griezmann',    team: 'France',    flag: '🇫🇷' },
  { name: 'O. Dembélé',      team: 'France',    flag: '🇫🇷' },
  { name: 'R. Dias',         team: 'Portugal',  flag: '🇵🇹' },
  { name: 'B. Fernandes',    team: 'Portugal',  flag: '🇵🇹' },
  { name: 'C. Ronaldo',      team: 'Portugal',  flag: '🇵🇹' },
  { name: 'P. Dybala',       team: 'Argentina', flag: '🇦🇷' },
  { name: 'J. Alvarez',      team: 'Argentina', flag: '🇦🇷' },
  { name: 'R. Gravenberch',  team: 'Netherlands', flag: '🇳🇱' },
  { name: 'V. van Dijk',     team: 'Netherlands', flag: '🇳🇱' },
  { name: 'T. Müller',       team: 'Germany',   flag: '🇩🇪' },
  { name: 'J. Wirtz',        team: 'Germany',   flag: '🇩🇪' },
  { name: 'K. Havertz',      team: 'Germany',   flag: '🇩🇪' },
  { name: 'F. Valverde',     team: 'Uruguay',   flag: '🇺🇾' },
  { name: 'D. Núñez',        team: 'Uruguay',   flag: '🇺🇾' },
  { name: 'S. Mané',         team: 'Senegal',   flag: '🇸🇳' },
  { name: 'V. Osimhen',      team: 'Nigeria',   flag: '🇳🇬' },
  { name: 'A. Mitoma',       team: 'Japan',     flag: '🇯🇵' },
  { name: 'W. Endo',         team: 'Japan',     flag: '🇯🇵' },
  { name: 'Son Heung-min',   team: 'South Korea', flag: '🇰🇷' },
  { name: 'M. Salah',        team: 'Egypt',     flag: '🇪🇬' },
  { name: 'P. Schick',       team: 'Czech Rep.', flag: '🇨🇿' },
  { name: 'G. Ramos',        team: 'Portugal',  flag: '🇵🇹' },
  { name: 'R. Sterling',     team: 'England',   flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'R. Bobb',         team: 'Norway',    flag: '🇳🇴' },
  { name: 'P. Neto',         team: 'Portugal',  flag: '🇵🇹' },
  { name: 'G. Martínez',     team: 'Argentina', flag: '🇦🇷' },
  { name: 'R. Rodríguez',    team: 'Mexico',    flag: '🇲🇽' },
  { name: 'H. Lozano',       team: 'Mexico',    flag: '🇲🇽' },
  { name: 'T. Hernández',    team: 'France',    flag: '🇫🇷' },
  { name: 'W. Zaire-Emery',  team: 'France',    flag: '🇫🇷' },
];

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export function PlayerSearch({ value, onChange }: Props) {
  const [query,    setQuery]    = useState(value);
  const [open,     setOpen]     = useState(false);
  const [focused,  setFocused]  = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef      = useRef<HTMLUListElement>(null);

  const filtered = query.trim().length === 0
    ? PLAYERS
    : PLAYERS.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.team.toLowerCase().includes(query.toLowerCase()),
      );

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function select(player: Player) {
    setQuery(player.name);
    onChange(player.name);
    setOpen(false);
    setFocused(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) { if (e.key === 'ArrowDown') setOpen(true); return; }
    if (e.key === 'ArrowDown') {
      setFocused((f) => Math.min(f + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      setFocused((f) => Math.max(f - 1, 0));
    } else if (e.key === 'Enter' && focused >= 0) {
      select(filtered[focused]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  // Scroll focused item into view
  useEffect(() => {
    if (focused >= 0 && listRef.current) {
      listRef.current.children[focused]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focused]);

  const selectedPlayer = PLAYERS.find((p) => p.name === value);

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
          person_search
        </span>
        {selectedPlayer && query === selectedPlayer.name && (
          <span className="absolute left-10 top-1/2 -translate-y-1/2 text-lg pointer-events-none">
            {selectedPlayer.flag}
          </span>
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
            setFocused(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search player…"
          autoComplete="off"
          className={[
            'input-field',
            selectedPlayer && query === selectedPlayer.name ? 'pl-16' : 'pl-10',
          ].join(' ')}
          aria-autocomplete="list"
          aria-expanded={open}
          role="combobox"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); onChange(''); setOpen(true); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Clear"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          role="listbox"
          className={[
            'absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto',
            'bg-surface-container border border-white/15 rounded-xl shadow-2xl',
            'divide-y divide-white/5',
          ].join(' ')}
        >
          {filtered.map((player, idx) => (
            <li
              key={player.name}
              role="option"
              aria-selected={player.name === value}
              onMouseDown={() => select(player)}
              onMouseEnter={() => setFocused(idx)}
              className={[
                'flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-100',
                idx === focused || player.name === value
                  ? 'bg-primary-container/15'
                  : 'hover:bg-white/5',
              ].join(' ')}
            >
              <span className="text-xl w-7 flex-shrink-0">{player.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="font-body-md text-on-surface truncate">{player.name}</p>
                <p className="font-label-caps text-label-caps text-on-surface-variant/60 truncate">{player.team}</p>
              </div>
              {player.name === value && (
                <span className="material-symbols-outlined text-primary-container text-[18px] flex-shrink-0">check</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
