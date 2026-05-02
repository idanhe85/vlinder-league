import Link from 'next/link';
import { NAV_ITEMS } from './navItems';
import { NavLink } from './NavLink';

interface NavContentProps {
  /** Passed to every NavLink so the drawer can close on navigation */
  onLinkClick?: () => void;
}

/**
 * The inner contents of the navigation — shared between SideNav (desktop)
 * and MobileDrawer (mobile).  Keeping markup in one place means a single
 * change propagates to both surfaces.
 */
export function NavContent({ onLinkClick }: NavContentProps) {
  return (
    <>
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant shrink-0">
            <span
              className="material-symbols-outlined text-[20px] text-primary-container"
              aria-hidden="true"
            >
              emoji_events
            </span>
          </div>
          <div>
            <p className="font-h3 text-sm font-black italic text-primary-container tracking-tighter leading-none">
              Vlinder League
            </p>
            <p className="font-label-caps text-label-caps text-on-surface-variant mt-0.5">
              30 Members Active
            </p>
          </div>
        </div>

        {/* CTA button */}
        <Link
          href="/match-center"
          onClick={onLinkClick}
          className="btn-primary mt-5 w-full text-center text-sm py-2.5 rounded-lg block no-underline"
        >
          Place Prediction
        </Link>
      </div>

      {/* Nav items */}
      <nav
        className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} onClick={onLinkClick} />
        ))}
      </nav>

      {/* Footer links */}
      <div className="px-3 py-4 border-t border-white/5 flex flex-col gap-0.5">
        <NavLink
          item={{ href: '/profile', label: 'My Profile', icon: 'person' }}
          onClick={onLinkClick}
        />
        <button
          type="button"
          className={[
            'flex items-center gap-3 py-3 px-4 rounded-lg w-full',
            'font-h3 text-sm font-semibold tracking-wide text-left',
            'text-error/70 hover:bg-white/5 hover:text-error',
            'transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-1 focus-visible:ring-offset-background',
          ].join(' ')}
        >
          <span className="material-symbols-outlined text-[22px] shrink-0" aria-hidden="true">
            logout
          </span>
          Logout
        </button>
      </div>
    </>
  );
}
