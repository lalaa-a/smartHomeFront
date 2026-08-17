import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase';
import type { Device } from '../types';

/** Realtime listener for the devices on a floor. */
export function useFloorDevices(
  houseId: string | undefined,
  floorId: string | undefined
): { devices: Device[]; loading: boolean } {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!houseId || !floorId) {
      setDevices([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const r = ref(db, `houses/${houseId}/floors/${floorId}/devices`);
    onValue(
      r,
      (snap) => {
        const value = snap.val() as Record<string, Device> | null;
        setDevices(
          Object.entries(value ?? {})
            .map(([deviceId, device]) => ({ ...device, deviceId }) as Device)
            .sort((a, b) => a.label.localeCompare(b.label))
        );
        setLoading(false);
      },
      (err) => {
        console.warn('[useFloorDevices] listen failed', err);
        setLoading(false);
      }
    );
    return () => off(r);
  }, [houseId, floorId]);

  return { devices, loading };
}
