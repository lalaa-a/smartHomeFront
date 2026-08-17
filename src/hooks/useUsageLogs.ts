import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase';
import type { UsageLog } from '../types';

/** Realtime listener for every usage log of a house. */
export function useUsageLogs(houseId: string | undefined): {
  logs: UsageLog[];
  loading: boolean;
} {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!houseId) {
      setLogs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const r = ref(db, `houses/${houseId}/usageLogs`);
    onValue(
      r,
      (snap) => {
        const value = snap.val() as Record<string, Omit<UsageLog, 'logId'>> | null;
        setLogs(
          Object.entries(value ?? {}).map(([logId, log]) => ({ logId, ...log } as UsageLog))
        );
        setLoading(false);
      },
      (err) => {
        console.warn('[useUsageLogs] listen failed', err);
        setLoading(false);
      }
    );
    return () => off(r);
  }, [houseId]);

  return { logs, loading };
}
