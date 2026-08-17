import type { Device, DeviceStatus } from '../types';

/**
 * Status used for rendering. A multiswitch is effectively ON whenever any of
 * its sub-switches is ON; injected faults (ERROR/DISCONNECTED) still win.
 */
export function effectiveDeviceStatus(device: Device): DeviceStatus {
  if (device.status === 'ERROR' || device.status === 'DISCONNECTED') return device.status;
  if (device.type === 'multiswitch') {
    const anyOn = Object.values(device.switches ?? {}).some((s) => s.status === 'ON');
    return anyOn ? 'ON' : 'OFF';
  }
  return device.status;
}
