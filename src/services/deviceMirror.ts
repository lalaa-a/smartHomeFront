import { ref, update, push } from 'firebase/database';
import { db } from '../firebase';
import type { LastUpdatedBy } from '../types';
import { withWriteError } from './errorToast';

const SIMULATOR: LastUpdatedBy = 'simulator';

function deviceRef(houseId: string, floorId: string, deviceId: string) {
  return ref(db, `houses/${houseId}/floors/${floorId}/devices/${deviceId}`);
}

async function writeDevice(
  houseId: string,
  floorId: string,
  deviceId: string,
  patch: Record<string, unknown>
): Promise<void> {
  const now = Date.now();
  await update(deviceRef(houseId, floorId, deviceId), {
    ...patch,
    lastUpdatedAt: now,
    lastUpdatedBy: SIMULATOR,
  });
}

async function pushAlert(
  houseId: string,
  floorId: string,
  deviceId: string,
  message: string,
  severity: 'info' | 'warning' | 'critical'
): Promise<void> {
  await push(ref(db, `houses/${houseId}/alerts`), {
    deviceId,
    floorId,
    message,
    severity,
    createdAt: Date.now(),
    acknowledged: false,
  });
}

/** Simulates a hardware fault: device reports ERROR and raises a warning alert. */
export async function injectError(
  houseId: string,
  floorId: string,
  deviceId: string,
  message = 'Simulated hardware fault'
): Promise<void> {
  await withWriteError('Inject error', async () => {
    await writeDevice(houseId, floorId, deviceId, { status: 'ERROR' });
    await pushAlert(houseId, floorId, deviceId, message, 'warning');
  });
}

/** Simulates the device losing connectivity. */
export async function injectDisconnect(houseId: string, floorId: string, deviceId: string): Promise<void> {
  await withWriteError('Inject disconnect', () =>
    writeDevice(houseId, floorId, deviceId, { status: 'DISCONNECTED' })
  );
}

/** Clears any injected fault and parks the device in the OFF state. */
export async function clearFault(houseId: string, floorId: string, deviceId: string): Promise<void> {
  await withWriteError('Clear fault', () =>
    writeDevice(houseId, floorId, deviceId, { status: 'OFF' })
  );
}

/**
 * Mirrors a physical toggle: outlet/light ON or OFF. Extra fields (e.g. the
 * safety slot's turnedOnAt) are merged into the same write.
 */
export async function reflectPhysicalToggle(
  houseId: string,
  floorId: string,
  deviceId: string,
  on: boolean,
  extra: Record<string, unknown> = {}
): Promise<void> {
  await withWriteError('Toggle power', () =>
    writeDevice(houseId, floorId, deviceId, { status: on ? 'ON' : 'OFF', ...extra })
  );
}

/** Mirrors flipping one switch on a multiswitch device. */
export async function reflectSwitch(
  houseId: string,
  floorId: string,
  deviceId: string,
  switchId: string,
  on: boolean
): Promise<void> {
  await withWriteError('Toggle switch', async () => {
    const now = Date.now();
    await Promise.all([
      update(ref(db, `houses/${houseId}/floors/${floorId}/devices/${deviceId}/switches/${switchId}`), {
        status: on ? 'ON' : 'OFF',
      }),
      update(deviceRef(houseId, floorId, deviceId), {
        lastUpdatedAt: now,
        lastUpdatedBy: SIMULATOR,
      }),
    ]);
  });
}

/** Pushes a fresh mock camera snapshot so the mobile feed updates live. */
export async function pushNewSnapshot(houseId: string, floorId: string, deviceId: string): Promise<void> {
  const seed = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  await withWriteError('Push snapshot', () =>
    writeDevice(houseId, floorId, deviceId, {
      snapshotUrl: `https://picsum.photos/seed/${seed}/640/360`,
      lastSnapshotAt: Date.now(),
    })
  );
}

/** Simulates the server-side safety cutoff: force-OFF plus a critical alert. */
export async function triggerSafetyCutoff(
  houseId: string,
  floorId: string,
  deviceId: string,
  message = 'Safety cutoff triggered — device force-turned-off.'
): Promise<void> {
  await withWriteError('Safety cutoff', async () => {
    await writeDevice(houseId, floorId, deviceId, { status: 'OFF', autoOffTriggered: true });
    await pushAlert(houseId, floorId, deviceId, message, 'critical');
  });
}
