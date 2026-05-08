'use client';

import { useEffect } from 'react';

export default function MatchCenterError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Match center error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background px-5 py-10 max-w-[80rem] mx-auto">
      <h1 className="font-h1 text-h1 text-error mb-4">Match Center Error</h1>
      <div className="bg-error/10 border border-error/30 rounded-xl p-6 mb-6">
        <p className="font-body-md text-error font-semibold mb-2">{error.message}</p>
        <pre className="text-xs text-error/70 whitespace-pre-wrap overflow-auto max-h-64">
          {error.stack}
        </pre>
      </div>
      <button
        type="button"
        onClick={reset}
        className="px-6 py-2 bg-primary-container text-on-primary-container rounded-lg font-label-caps text-label-caps"
      >
        Try again
      </button>
    </main>
  );
}
