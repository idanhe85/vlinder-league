'use client';

import { useEffect } from 'react';
import { NavContent } from './NavContent';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Mobile slide-in navigation drawer.
 *
 * Transition design:
 *  - The drawer uses CSS `transform: translateX` so the animation runs on
 *    the GPU compositor thread — no layout or paint cost.
 *  - Easing: cubic-bezier(0.4, 0, 0.2, 1) — Material-style "standard" curve.
 *    Opens fast (ease-out feel), closes slightly slower (ease-in feel).
 *  - Duration: 300ms (perceptible but not sluggish on repeated taps).
 *
 * Backdrop:
 *  - Stays mounted when closed (opacity-0 + pointer-events-none) so the
 *    fade-out transition plays correctly.
 *
 * Scroll lock:
 *  - `overflow-hidden` is set on <body> while the drawer is open to prevent
 *    background scrolling on iOS (which ignores `overflow:hidden` on html).
 */
export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  // Lock body scroll while drawer is open
  useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <>
      {/* ── Backdrop ────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={[
          'fixed inset-0 z-40 md:hidden',
          'bg-black/60 backdrop-blur-sm',
          'transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* ── Drawer panel ────────────────────────────────────────── */}
      <aside
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={[
          // Sizing + positioning
          'fixed top-0 left-0 h-full w-72 z-50 md:hidden',
          'flex flex-col',
          // Pitch Pulse glass style (slightly more opaque than sidebar for readability)
          'bg-surface-container-lowest/95 backdrop-blur-2xl',
          'border-r border-white/5 shadow-2xl',
          // Slide transition — GPU-accelerated transform only
          'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Close button row */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            NAVIGATION
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className={[
              'w-8 h-8 rounded-lg flex items-center justify-center',
              'text-on-surface-variant hover:text-on-surface hover:bg-white/5',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container',
            ].join(' ')}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        {/* Reuse the exact same content as the desktop sidebar */}
        <NavContent onLinkClick={onClose} />
      </aside>
    </>
  );
}
