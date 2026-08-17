import { useEffect, useRef, useState } from 'react';
import { useAlerts } from '../hooks/useAlerts';
import { SEVERITY_COLORS, SEVERITY_LABELS } from './status';

interface AlertToastProps {
  houseId: string;
}

const TOAST_VISIBLE_MS = 4200;

/**
 * Surfaces newly arriving critical alerts as an in-app toast, mirroring the
 * mobile foreground-push banner. Preexisting alerts are not toasted.
 */
export function AlertToast({ houseId }: AlertToastProps) {
  const alerts = useAlerts(houseId);
  const [message, setMessage] = useState<string | null>(null);
  const lastSeenRef = useRef(0);
  const initializedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (alerts.length === 0) return;
    const newest = alerts[0];

    if (!initializedRef.current) {
      lastSeenRef.current = newest.createdAt;
      initializedRef.current = true;
      return;
    }

    if (newest.severity === 'critical' && newest.createdAt > lastSeenRef.current) {
      lastSeenRef.current = newest.createdAt;
      setMessage(newest.message);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setMessage(null), TOAST_VISIBLE_MS);
    }
  }, [alerts]);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    []
  );

  if (!message) return null;

  const color = SEVERITY_COLORS.critical;

  return (
    <div className="toast-in fixed right-4 top-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
      <div
        className="flex items-start gap-3 rounded-lg border bg-surface-raised p-4"
        style={{ borderColor: color }}
      >
        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color, animation: 'device-pulse 2.2s ease-out infinite' }}
        />
        <div className="min-w-0 flex-1">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.16em]"
            style={{ color }}
          >
            {SEVERITY_LABELS.critical} ALERT
          </p>
          <p className="mt-1 font-sans text-sm text-text-primary">{message}</p>
        </div>
        <button
          type="button"
          onClick={() => setMessage(null)}
          className="font-mono text-sm text-text-muted transition-colors hover:text-text-primary"
          aria-label="Dismiss alert"
        >
          ×
        </button>
      </div>
    </div>
  );
}
