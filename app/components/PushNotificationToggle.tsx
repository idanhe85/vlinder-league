'use client';

import { useEffect, useState } from 'react';

type State = 'loading' | 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed';

async function getRegistration() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
  return navigator.serviceWorker.register('/sw.js');
}

export function PushNotificationToggle() {
  const [state, setState] = useState<State>('loading');

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      setState('denied');
      return;
    }
    navigator.serviceWorker.register('/sw.js').then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? 'subscribed' : 'unsubscribed');
    });
  }, []);

  async function enable() {
    const reg = await getRegistration();
    if (!reg) return;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setState('denied');
      return;
    }

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });

    const json = sub.toJSON();
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
    });

    setState('subscribed');
  }

  async function disable() {
    const reg = await getRegistration();
    if (!reg) return;

    const sub = await reg.pushManager.getSubscription();
    if (!sub) { setState('unsubscribed'); return; }

    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });

    await sub.unsubscribe();
    setState('unsubscribed');
  }

  if (state === 'loading') return null;

  if (state === 'unsupported') {
    return (
      <div className="flex items-center gap-2 text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px]">notifications_off</span>
        <span className="font-body-md text-body-md">Not supported on this browser</span>
      </div>
    );
  }

  if (state === 'denied') {
    return (
      <div className="flex items-center gap-2 text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px] text-error">notifications_off</span>
        <span className="font-body-md text-body-md">Blocked — enable in browser settings</span>
      </div>
    );
  }

  const isOn = state === 'subscribed';

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-on-surface-variant">
        <span className={`material-symbols-outlined text-[18px] ${isOn ? 'text-primary-container' : ''}`}>
          {isOn ? 'notifications_active' : 'notifications'}
        </span>
        <span className="font-body-md text-body-md">Match reminders</span>
      </div>

      <button
        type="button"
        onClick={isOn ? disable : enable}
        aria-pressed={isOn}
        className={[
          'relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0',
          isOn ? 'bg-primary-container' : 'bg-surface-container-highest border border-white/20',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 w-5 h-5 rounded-full shadow transition-transform duration-200',
            isOn ? 'translate-x-5 bg-background' : 'translate-x-0.5 bg-on-surface-variant',
          ].join(' ')}
        />
        <span className="sr-only">{isOn ? 'Disable match reminders' : 'Enable match reminders'}</span>
      </button>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
