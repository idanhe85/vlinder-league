'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { MotionButton } from '@/app/components/MotionButton';

const DOMAIN = '@vlinder.league';

export default function LoginPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email:    username.trim().toLowerCase() + DOMAIN,
      password,
    });

    if (error) {
      setError('Invalid username or password.');
    } else {
      router.push('/');
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      {/* Decorative glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(195,244,0,0.08) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="w-full max-w-sm relative">
        {/* Brand */}
        <div className="text-center mb-10">
          <p className="font-label-caps text-label-caps text-primary-container mb-2">
            WORLD CUP 2026
          </p>
          <h1 className="font-h1 text-h1 text-primary italic tracking-tight">
            Vlinder League
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Predict. Compete. Win beers.
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-container/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-7 shadow-2xl">
          <h2 className="font-h3 text-h3 text-primary mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                required
                autoComplete="username"
                className="input-field"
              />
            </div>

            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="input-field"
              />
            </div>

            {error && (
              <p className="text-error text-sm font-body-md bg-error-container/10 border border-error/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <MotionButton
              type="submit"
              disabled={loading}
              className="w-full mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </MotionButton>
          </form>
        </div>
      </div>
    </div>
  );
}
