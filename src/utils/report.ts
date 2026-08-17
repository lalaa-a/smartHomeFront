import type { UsageLog } from '../types';

/**
 * Client-side mirror of backend/src/services/reportService.js — sums
 * durationMinutes per device within the [fromMs, toMs] window.
 */
export function aggregateUsage(
  logs: UsageLog[],
  fromMs: number,
  toMs: number
): Record<string, number> {
  const totals: Record<string, number> = {};

  for (const log of logs) {
    if (!log || !log.deviceId) continue;
    const timestamp = Number(log.timestamp);
    if (!Number.isFinite(timestamp)) continue;
    if (timestamp < fromMs || timestamp > toMs) continue;

    const minutes = Number(log.durationMinutes);
    if (!Number.isFinite(minutes) || minutes <= 0) continue;

    totals[log.deviceId] = (totals[log.deviceId] ?? 0) + minutes;
  }

  return totals;
}

export function totalsToReport(
  totals: Record<string, number>
): Array<{ deviceId: string; totalOnMinutes: number }> {
  return Object.entries(totals)
    .map(([deviceId, totalOnMinutes]) => ({ deviceId, totalOnMinutes }))
    .sort((a, b) => b.totalOnMinutes - a.totalOnMinutes);
}

export function msToWindow(ms: number): { fromMs: number; toMs: number } {
  const toMs = Date.now();
  return { fromMs: toMs - ms, toMs };
}

export function formatMinutes(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}
