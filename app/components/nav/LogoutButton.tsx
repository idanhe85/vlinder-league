'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export function LogoutButton() {
  const { signOut } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
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
  );
}
