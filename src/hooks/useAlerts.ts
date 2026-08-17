import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase';
import type { Alert } from '../types';

/** Realtime listener for a house's alert log, newest first. */
export function useAlerts(houseId: string | undefined): Alert[] {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (!houseId) {
      setAlerts([]);
      return;
    }
    const r = ref(db, `houses/${houseId}/alerts`);
    onValue(
      r,
      (snap) => {
        const value = snap.val() as Record<string, Alert> | null;
        setAlerts(
          Object.entries(value ?? {})
            .map(([alertId, alert]) => ({ ...alert, alertId }) as Alert)
            .sort((a, b) => b.createdAt - a.createdAt)
        );
      },
      (err) => console.warn('[useAlerts] listen failed', err)
    );
    return () => off(r);
  }, [houseId]);

  return alerts;
}
