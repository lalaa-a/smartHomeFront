/**
 * TypeScript interfaces mirroring `firebase-schema.md` exactly.
 *
 * /houses/{houseId}
 *   name, ownerId, createdAt
 *   /floors/{floorId}
 *     name, planImageUrl, gridWidth, gridHeight, order
 *     /devices/{deviceId}
 *   /alerts/{alertId}
 *   /usageLogs/{logId}
 *   /fcmTokens/{tokenKey}
 */

export type DeviceType = 'outlet' | 'multiswitch' | 'safety_slot' | 'camera' | 'light';
export type DeviceStatus = 'ON' | 'OFF' | 'ERROR' | 'DISCONNECTED';
export type LastUpdatedBy = 'app' | 'simulator' | 'system';
export type SwitchStatus = 'ON' | 'OFF';

export interface House {
  houseId: string;
  name: string;
  ownerId: string;
  createdAt: number;
  timezone?: string;
  imageUrl?: string;
}

export interface Floor {
  floorId: string;
  name: string;
  planImageUrl?: string;
  gridWidth: number;
  gridHeight: number;
  order: number;
}

interface DeviceBase {
  deviceId: string;
  type: DeviceType;
  label: string;
  gridX: number;
  gridY: number;
  status: DeviceStatus;
  lastUpdatedAt: number;
  lastUpdatedBy: LastUpdatedBy;
}

export interface OutletDevice extends DeviceBase {
  type: 'outlet';
}

export interface Switch {
  switchId?: string;
  label: string;
  status: SwitchStatus;
}

export interface MultiSwitchDevice extends DeviceBase {
  type: 'multiswitch';
  switchCount: number;
  switches: Record<string, Switch>;
}

export interface SafetySlotDevice extends DeviceBase {
  type: 'safety_slot';
  maxOnDurationMinutes: number;
  turnedOnAt?: number;
  autoOffTriggered?: boolean;
}

export interface CameraDevice extends DeviceBase {
  type: 'camera';
  snapshotUrl?: string;
  streamUri?: string;
  lastSnapshotAt?: number;
  /** Compass direction of the vision cone in degrees (0 = up, 90 = right). */
  direction?: number;
}

export interface LightDevice extends DeviceBase {
  type: 'light';
  scheduleEnabled?: boolean;
  scheduleStart?: string; // "HH:mm" 24h
  scheduleEnd?: string; // "HH:mm" 24h
}

export type Device =
  | OutletDevice
  | MultiSwitchDevice
  | SafetySlotDevice
  | CameraDevice
  | LightDevice;

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Alert {
  alertId: string;
  deviceId: string;
  floorId: string;
  message: string;
  severity: AlertSeverity;
  createdAt: number;
  acknowledged: boolean;
}

export type UsageEvent = 'ON' | 'OFF' | 'AUTO_OFF' | 'ERROR';

export interface UsageLog {
  logId: string;
  deviceId: string;
  event: UsageEvent;
  timestamp: number;
  durationMinutes?: number;
}

export interface ReportEntry {
  deviceId: string;
  totalOnMinutes: number;
}
