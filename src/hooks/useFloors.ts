import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase';
import type { Floor } from '../types';

/** Realtime listener for the floors of a house, ordered by grid position. */
export function useFloors(houseId: string | undefined): { floors: Floor[]; loading: boolean } {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!houseId) {
      setFloors([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const r = ref(db, `houses/${houseId}/floors`);
    onValue(
      r,
      (snap) => {
        const value = snap.val() as Record<string, Floor> | null;
        setFloors(
          Object.entries(value ?? {})
            .map(([floorId, floor]) => ({ ...floor, floorId }) as Floor)
            .sort((a, b) => a.order - b.order || a.floorId.localeCompare(b.floorId))
        );
        setLoading(false);
      },
      (err) => {
        console.warn('[useFloors] listen failed', err);
        setLoading(false);
      }
    );
    return () => off(r);
  }, [houseId]);

  return { floors, loading };
}
