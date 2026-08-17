import { useEffect, useState } from 'react';

export interface Countdown {
  /** Remaining fraction in [0, 1], 1 = full, 0 = drained. */
  progress: number;
  /** Remaining time in ms (clamped at 0). */
  remainingMs: number;
}

/** Recomputes the safety-slot countdown every second from turnedOnAt + max duration. */
export function useCountdown(
  turnedOnAt: number | undefined,
  maxOnDurationMinutes: number | undefined
): Countdown {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!turnedOnAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [turnedOnAt]);

  if (!turnedOnAt || !maxOnDurationMinutes || maxOnDurationMinutes <= 0) {
    return { progress: 1, remainingMs: 0 };
  }

  const maxMs = maxOnDurationMinutes * 60_000;
  const remainingMs = Math.max(0, turnedOnAt + maxMs - now);
  const progress = Math.min(1, Math.max(0, remainingMs / maxMs));
  return { progress, remainingMs };
}
