'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

interface TopBarProps {
  onMenuToggle: () => void;
  drawerOpen: boolean;
}

/**
 * Fixed top application bar.
 *
 * Desktop (md+):
 *   - Offset left by the sidebar width (left: 256px) so it sits alongside it.
 *   - Shows only the right-side utilities (notifications, settings, avatar).
 *
 * Mobile (<md):
 *   - Full width (left: 0).
 *   - Left slot: animated hamburger → close button.
 *   - Centre: "Vlinder League" brand (since the sidebar is hidden).
 *   - Right slot: avatar only (icon buttons would crowd the bar).
 *
 * Hamburger animation:
 *   Three spans (top / middle / bottom bar) transition to an × via
 *   CSS `transform` and `opacity`.  All three converge to the vertical
 *   midpoint (`top-[6px]`), then the outer two rotate ±45°.
 *   The middle bar fades out via `opacity-0`.
 */
export function TopBar({ onMenuToggle, drawerOpen }: TopBarProps) {
  const { user, signOut, avatarUrl } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/login');
    router.refresh();
  }
  const username = user?.email?.split('@')[0] ?? '';
  const initials = username.slice(0, 2).toUpperCase() || 'VL';
  return (
    <header
      className={[
        'fixed top-0 right-0 z-40 h-16',
        // Desktop: leave room for the sidebar
        'left-0 md:left-64',
        // Glass style matching prototypes
        'bg-surface-container-lowest/80 backdrop-blur-xl',
        'border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
        // Layout
        'flex items-center justify-between px-5',
      ].join(' ')}
    >
      {/* ── Left slot ──────────────────────────────────────────── */}
      {/* Mobile: hamburger + brand. Desktop: invisible spacer. */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label={drawerOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={drawerOpen}
          aria-controls="mobile-drawer"
          className={[
            'w-9 h-9 flex items-center justify-center rounded-lg',
            'text-on-background hover:text-primary-container hover:bg-white/5',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container',
          ].join(' ')}
        >
          {/* Three bars → × morph */}
          <div className="w-5 h-[14px] relative" aria-hidden="true">
            <span
              className={[
                'absolute left-0 right-0 h-0.5 bg-current rounded-full',
                'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] origin-center',
                drawerOpen ? 'top-[6px] rotate-45' : 'top-0',
              ].join(' ')}
            />
            <span
              className={[
                'absolute left-0 right-0 top-[6px] h-0.5 bg-current rounded-full',
                'transition-all duration-200',
                drawerOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100',
              ].join(' ')}
            />
            <span
              className={[
                'absolute left-0 right-0 h-0.5 bg-current rounded-full',
                'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] origin-center',
                drawerOpen ? 'top-[6px] -rotate-45' : 'top-[12px]',
              ].join(' ')}
            />
          </div>
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Vlinder League" className="w-7 h-7 rounded-full object-contain" />
        <span className="font-h3 text-sm font-black italic text-primary-container tracking-tighter select-none">
          Vlinder League
        </span>
      </div>

      {/* Desktop: empty left flex child so justify-between pushes icons right */}
      <div className="hidden md:block" aria-hidden="true" />

      {/* ── Right slot ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Bell: shown only after tournament start (2026-06-11) */}
        {Date.now() >= new Date('2026-06-11T19:00:00Z').getTime() && (
          <button
            type="button"
            aria-label="Notifications"
            className={[
              'w-9 h-9 flex items-center justify-center rounded-lg',
              'text-on-surface-variant hover:text-primary-container hover:bg-white/5',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container',
            ].join(' ')}
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
              notifications
            </span>
          </button>
        )}

        {/* Sign out */}
        {user && (
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            className={[
              'w-9 h-9 flex items-center justify-center rounded-lg',
              'text-on-surface-variant hover:text-error hover:bg-white/5',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container',
            ].join(' ')}
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">logout</span>
          </button>
        )}

        {/* Avatar */}
        <div
          aria-label={user?.email ?? 'Guest'}
          title={user?.email ?? 'Guest'}
          className="w-8 h-8 rounded-full border border-primary-container/40 overflow-hidden cursor-default bg-surface-container-highest flex items-center justify-center"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
          ) : (
            <span className="font-label-caps text-[10px] text-primary-container select-none">
              {initials}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
