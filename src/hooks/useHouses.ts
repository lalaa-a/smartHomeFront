import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase';
import type { House } from '../types';

/** Realtime listener for every house node (simulator has no auth — it mirrors all). */
export function useHouses(): { houses: House[]; loading: boolean } {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const r = ref(db, 'houses');
    onValue(
      r,
      (snap) => {
        const value = snap.val() as Record<string, House> | null;
        setHouses(
          Object.entries(value ?? {})
            .map(([houseId, house]) => ({ ...house, houseId }) as House)
            .sort((a, b) => a.createdAt - b.createdAt)
        );
        setLoading(false);
      },
      (err) => {
        console.warn('[useHouses] listen failed', err);
        setLoading(false);
      }
    );
    return () => off(r);
  }, []);

  return { houses, loading };
}
