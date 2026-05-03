'use client';

import { useState } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/app/context/AuthContext';
import { PredictionProvider } from '@/app/context/PredictionContext';
import { SideNav } from './SideNav';
import { MobileDrawer } from './MobileDrawer';
import { TopBar } from './TopBar';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShell — the single client-side orchestrator for the navigation layout.
 *
 * Manages one piece of state: whether the mobile drawer is open.
 * Everything else (sidebar, topbar, drawer contents) is declarative.
 *
 * Layout structure:
 *
 *   ┌─────────────────────────────────────────────────────┐
 *   │  TopBar (fixed, h-16, left: 0 → left: 256px on md) │
 *   ├──────────┬──────────────────────────────────────────┤
 *   │ SideNav  │  <main>                                  │
 *   │ (fixed,  │    pt-16  (clears TopBar)                │
 *   │  w-64,   │    md:pl-64  (clears sidebar)            │
 *   │  md+)    │  </main>                                 │
 *   └──────────┴──────────────────────────────────────────┘
 *
 *   Mobile (<md):
 *   ┌─────────────────────────────────┐
 *   │  TopBar (full width)  [☰]       │
 *   ├─────────────────────────────────┤
 *   │  <main> (full width, pt-16)     │
 *   └─────────────────────────────────┘
 *   + MobileDrawer slides over from the left when open
 *   + semi-transparent backdrop covers the content area
 *
 * Server components passed as children are NOT re-rendered on the client —
 * React treats them as opaque elements.  This is the correct App Router
 * pattern for wrapping server-rendered pages in a client shell.
 */
export function AppShell({ children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AuthProvider>
    <PredictionProvider>
      <TopBar
        onMenuToggle={() => setDrawerOpen((o) => !o)}
        drawerOpen={drawerOpen}
      />
      <SideNav />
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <div className="pt-16 md:pl-64 min-h-screen">
        {children}
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(30, 34, 38, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.75rem',
            color: '#e8eaed',
            fontFamily: 'var(--loaded-font-inter, sans-serif)',
            fontSize: '0.875rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            padding: '12px 16px',
          },
          // Icon for success toasts is overridden per-call
          duration: 3000,
        }}
      />
    </PredictionProvider>
    </AuthProvider>
  );
}
