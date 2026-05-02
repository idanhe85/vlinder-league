/** Single source of truth for all navigation destinations. */
export interface NavItem {
  href: string;
  label: string;
  /** Material Symbols Outlined icon name */
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/',             label: 'Dashboard',    icon: 'dashboard'     },
  { href: '/match-center', label: 'Match Center', icon: 'sports_soccer' },
  { href: '/props',        label: 'Prop Bets',    icon: 'military_tech' },
  { href: '/leaderboard',  label: 'Leaderboard',  icon: 'leaderboard'   },
  { href: '/insights',     label: 'Insights',     icon: 'analytics'     },
];
