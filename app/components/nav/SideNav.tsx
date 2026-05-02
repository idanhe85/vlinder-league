import { NavContent } from './NavContent';

/**
 * Desktop sidebar — visible from md breakpoint upward.
 * This is a Server Component: it has no state and renders NavContent
 * (which contains NavLink client components for active-state detection).
 */
export function SideNav() {
  return (
    <aside
      className={[
        // Positioning
        'fixed top-0 left-0 h-full w-64 z-50',
        // Hidden on mobile, flex column on desktop
        'hidden md:flex flex-col',
        // Pitch Pulse glass style
        'bg-surface-container-lowest/90 backdrop-blur-2xl',
        'border-r border-white/5 shadow-2xl',
      ].join(' ')}
      aria-label="Desktop sidebar"
    >
      <NavContent />
    </aside>
  );
}
