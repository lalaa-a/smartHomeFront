import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase';

/**
 * True while the Firebase Realtime Database socket is up, driven by RTDB's own
 * `.info/connected` special path. Defaults to true before the first signal so
 * the UI never flashes OFFLINE on load.
 */
export function useConnectionStatus(): boolean {
  const [connected, setConnected] = useState<boolean>(true);

  useEffect(() => {
    const r = ref(db, '.info/connected');
    onValue(r, (snap) => setConnected(snap.val() === true));
    return () => off(r);
  }, []);

  return connected;
}
