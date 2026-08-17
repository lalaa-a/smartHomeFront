import { useMemo, useState } from 'react';
import { useUsageLogs } from '../hooks/useUsageLogs';
import { aggregateUsage, totalsToReport, msToWindow, formatMinutes } from '../utils/report';
import { COLORS } from '../tokens';

const RANGES = [
  { label: '24H', ms: 24 * 60 * 60 * 1000 },
  { label: '7D', ms: 7 * 24 * 60 * 60 * 1000 },
  { label: '30D', ms: 30 * 24 * 60 * 60 * 1000 },
] as const;

interface UsageBarsProps {
  houseId: string;
  deviceIds: string[];
  labels?: Record<string, string>;
}

/** Horizontal on-time bars for the top devices on the active floor. */
export function UsageBars({ houseId, deviceIds, labels }: UsageBarsProps) {
  const { logs, loading } = useUsageLogs(houseId);
  const [rangeMs, setRangeMs] = useState(RANGES[0].ms);

  const report = useMemo(() => {
    const { fromMs, toMs } = msToWindow(rangeMs);
    const totals = aggregateUsage(logs, fromMs, toMs);
    const inFloor = new Set(deviceIds);
    return totalsToReport(totals).filter((r) => inFloor.has(r.deviceId)).slice(0, 5);
  }, [logs, rangeMs, deviceIds]);

  const maxMinutes = Math.max(...report.map((r) => r.totalOnMinutes), 1);

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
          on-time // top devices
        </p>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setRangeMs(r.ms)}
              className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                rangeMs === r.ms
                  ? 'border-accent-amber text-accent-amber'
                  : 'border-border text-text-muted hover:text-text-primary'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading && report.length === 0 ? (
        <p className="mt-6 font-mono text-xs text-text-muted">LOADING…</p>
      ) : report.length === 0 ? (
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
          no usage in this window
        </p>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          {report.map((r) => {
            const label = (labels?.[r.deviceId] ?? r.deviceId).slice(0, 18);
            const width = `${Math.max(4, (r.totalOnMinutes / maxMinutes) * 100)}%`;
            return (
              <div key={r.deviceId}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate font-mono text-[10px] text-text-muted">{label}</p>
                  <p className="shrink-0 font-mono text-[10px] text-accent-amber">
                    {formatMinutes(r.totalOnMinutes)}
                  </p>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-background">
                  <div
                    className="h-full rounded-full"
                    style={{ width, backgroundColor: COLORS.accentAmber }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
