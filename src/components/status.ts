import type { AlertSeverity, DeviceStatus, DeviceType } from '../types';
import { COLORS } from '../tokens';

export const STATUS_COLORS: Record<DeviceStatus, string> = {
  ON: COLORS.accentAmber,
  OFF: COLORS.textMutedStrong,
  ERROR: COLORS.danger,
  DISCONNECTED: COLORS.warning,
};

export const SEVERITY_COLORS: Record<AlertSeverity, string> = {
  info: COLORS.accentCyan,
  warning: COLORS.warning,
  critical: COLORS.danger,
};

export const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  info: 'INFO',
  warning: 'WARNING',
  critical: 'CRITICAL',
};

export const TYPE_LABELS: Record<DeviceType, string> = {
  outlet: 'OUTLET',
  multiswitch: 'MULTI-SWITCH',
  safety_slot: 'SAFETY SLOT',
  camera: 'CAMERA',
  light: 'LIGHT',
};
