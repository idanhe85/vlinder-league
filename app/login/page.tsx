'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';

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
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-6">
      {/* Decorative glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(195,244,0,0.08) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="w-full max-w-md mx-auto relative">
        {/* Brand */}
        <div className="text-center mb-10">
          <p className="font-label-caps text-label-caps text-primary-container mb-2 uppercase tracking-widest text-xs">
            World Cup 2026
          </p>
          <h1 className="font-h1 text-h1 text-primary italic tracking-tight">
            Vlinder League
          </h1>
          <p className="text-on-surface-variant mt-2 text-sm">
            Predict. Compete. Win beers.
          </p>
        </div>

        {/* Card */}
        <div className="w-full bg-surface-container/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="font-h3 text-h3 text-primary mb-6 whitespace-nowrap">Sign In</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                required
                autoComplete="username"
                className="w-full bg-surface-container-highest text-on-surface border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-container focus:shadow-[0_0_0_2px_rgba(195,244,0,0.2)] transition-all"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-surface-container-highest text-on-surface border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-container focus:shadow-[0_0_0_2px_rgba(195,244,0,0.2)] transition-all"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={loading ? undefined : { scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="w-full mt-1 bg-red-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl py-3.5 whitespace-nowrap hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}
