'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from './navItems';

interface NavLinkProps {
  item: NavItem;
  /** Called when a link is clicked — used by drawer to close itself */
  onClick?: () => void;
}

/**
 * A single navigation link that reads the current pathname to apply the
 * active state.  Both SideNav and MobileDrawer use this component, so
 * active-state logic lives in exactly one place.
 */
export function NavLink({ item, onClick }: NavLinkProps) {
  const pathname = usePathname();
  // Exact match for home, prefix match for everything else
  const isActive =
    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={[
        'flex items-center gap-3 py-3 px-4 rounded-lg',
        'font-h3 text-sm font-semibold tracking-wide',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-1 focus-visible:ring-offset-background',
        isActive
          ? 'bg-primary-container/10 text-primary-container border-r-4 border-primary-container'
          : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface hover:translate-x-1',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-current={isActive ? 'page' : undefined}
    >
      <span
        className="material-symbols-outlined text-[22px] shrink-0"
        aria-hidden="true"
      >
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}
