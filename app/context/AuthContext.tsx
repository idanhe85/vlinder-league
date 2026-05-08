'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  avatarUrl: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAdmin: false,
  avatarUrl: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]           = useState<User | null>(null);
  const [isAdmin, setIsAdmin]     = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);

  async function syncProfile(userId: string | undefined) {
    if (!userId) { setIsAdmin(false); setAvatarUrl(null); return; }
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('is_admin, avatar_url')
      .eq('id', userId)
      .single();
    setIsAdmin(data?.is_admin ?? false);
    setAvatarUrl(data?.avatar_url ?? null);
  }

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      await syncProfile(user?.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        syncProfile(session?.user?.id);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, avatarUrl, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
