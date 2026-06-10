'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';

const AVATARS = [
  '/images/De "Biertijd" Woede.gif',
  '/images/De Bal en Bier Balansact.gif',
  '/images/De Barbon-Straf.gif',
  '/images/De Bidon Stout-Plons.gif',
  '/images/De Bierkan Inworp.gif',
  '/images/De Donker Bier Wereldbeker.gif',
  '/images/De Duikende Pint-Redding.gif',
  '/images/De Frustratie van het Lege Glas.gif',
  '/images/De Fust-Kopbal.gif',
  '/images/De Kus op de Bieretiket-Aanvoerdersband.gif',
  '/images/De Kus op de Gouden Biertrofee.gif',
  '/images/De Kus op de Viltjessjaal.gif',
  '/images/De Magische Bierspons.gif',
  '/images/De Modderige Overwinningskreet.gif',
  '/images/De Modderige Schuim-Veger.gif',
  '/images/De Nerveuze Stout-Bezorging.gif',
  '/images/De Pintjes-Opstelling Tactiek.gif',
  '/images/De Pretzel-Microfoon Schok.gif',
  '/images/De Snack- en Biertactiek.gif',
  '/images/De Speciaalbier Waarschuwingskaart.gif',
  '/images/De Taphendel Strijdkreet.gif',
  '/images/De Uitgeputte Pint na de Wedstrijd.gif',
  '/images/De VAR-Biertap Review.gif',
  '/images/De Viltjes-Strafkaart.gif',
  '/images/De Voetbal Bierhelm.gif',
  '/images/De Vuvuzela Schuimknoei.gif',
  '/images/Gouden Schoen.gif',
  '/images/Het Biertje van de Fanatieke Supporter.gif',
  '/images/Het Happy Hour Wisselbord.gif',
  '/images/Het Troostbiertje.gif',
];

export default function RegisterPage() {
  const router = useRouter();

  const [username,    setUsername]    = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [avatar,      setAvatar]      = useState<string | null>(null);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username, password, display_name: displayName, avatar_url: avatar }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Registration failed.');
      setLoading(false);
      return;
    }

    const { error: signInError } = await createClient().auth.signInWithPassword({
      email:    username.trim().toLowerCase() + '@vlinder.league',
      password,
    });

    if (signInError) {
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } else {
      router.push('/');
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <div className="relative min-h-screen w-full bg-background overflow-hidden flex items-center justify-center p-5">

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/login_background.jpg)' }} />
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(195,244,0,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(2,102,255,0.05) 0%, transparent 60%)' }} />
      </div>

      <main className="relative z-10 w-full max-w-[500px] bg-surface-container/40 backdrop-blur-xl border border-white/10 border-t-white/20 rounded-xl p-10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col gap-7">

        <header className="flex flex-col items-center text-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Vlinder League" className="w-20 h-20 rounded-full object-contain border border-outline-variant bg-surface-container-highest shadow-[inset_0_2px_10px_rgba(0,0,0,0.5),0_0_20px_rgba(195,244,0,0.2)] mb-2" />
          <h1 className="font-h3 text-h3 text-primary-container italic uppercase tracking-tighter drop-shadow-md">Join Vlinder League</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Create your account and start predicting.</p>
        </header>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="material-symbols-outlined text-primary-container text-[48px]">check_circle</span>
            <p className="font-h3 text-h3 text-primary">Account created!</p>
            <p className="font-body-md text-on-surface-variant">Redirecting to login…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">

            {/* Avatar picker */}
            <div className="flex flex-col gap-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase ml-1">
                Choose your avatar
              </label>
              <div className="grid grid-cols-6 gap-2 bg-surface-container-highest/50 border border-outline-variant rounded-lg p-3 max-h-48 overflow-y-auto">
                {AVATARS.map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setAvatar(src)}
                    className={[
                      'relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all duration-150',
                      avatar === src
                        ? 'border-primary-container shadow-[0_0_12px_rgba(195,244,0,0.4)]'
                        : 'border-transparent hover:border-white/30',
                    ].join(' ')}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    {avatar === src && (
                      <div className="absolute inset-0 bg-primary-container/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary-container text-[16px]">check_circle</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {avatar && (
                <div className="flex items-center gap-2 mt-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-primary-container/50" />
                  <span className="font-label-caps text-label-caps text-primary-container text-[11px]">Avatar selected</span>
                </div>
              )}
            </div>

            {/* Username */}
            <div className="flex flex-col gap-1">
              <label htmlFor="username" className="font-label-caps text-label-caps text-on-surface-variant uppercase ml-1">Username</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">person</span>
                <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your_username" required autoComplete="username"
                  className="w-full bg-surface-container-highest border border-outline-variant rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all" />
              </div>
            </div>

            {/* Display name */}
            <div className="flex flex-col gap-1">
              <label htmlFor="display_name" className="font-label-caps text-label-caps text-on-surface-variant uppercase ml-1">
                Display Name <span className="normal-case opacity-50">(optional)</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">badge</span>
                <input id="display_name" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your Full Name" autoComplete="name"
                  className="w-full bg-surface-container-highest border border-outline-variant rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all" />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="font-label-caps text-label-caps text-on-surface-variant uppercase ml-1">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="new-password"
                  className="w-full bg-surface-container-highest border border-outline-variant rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all" />
              </div>
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1">
              <label htmlFor="confirm" className="font-label-caps text-label-caps text-on-surface-variant uppercase ml-1">Confirm Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock_reset</span>
                <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required autoComplete="new-password"
                  className="w-full bg-surface-container-highest border border-outline-variant rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all" />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={loading ? undefined : { scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="mt-1 w-full bg-primary-container text-on-primary-container font-h3 text-h3 uppercase py-3 rounded-lg shadow-[0_0_20px_rgba(195,244,0,0.15)] hover:bg-primary-fixed hover:shadow-[0_0_30px_rgba(195,244,0,0.3)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create Account'}
            </motion.button>

            <p className="text-center font-body-md text-body-md text-on-surface-variant">
              Already have an account?{' '}
              <a href="/login" className="text-primary-container hover:underline">Log in</a>
            </p>
          </form>
        )}
      </main>
    </div>
  );
}
