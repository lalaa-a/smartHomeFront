import type { Device } from '../types';
import { STATUS_COLORS } from './status';

export interface StatCardData {
  label: string;
  value: number;
  accent: string;
}

function StatCard({ label, value, accent, distribution }: StatCardData & { distribution: Array<{ value: number; color: string }> }) {
  const total = distribution.reduce((sum, d) => sum + d.value, 0) || 1;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">{label}</p>
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
      </div>
      <p className="mt-2 font-display text-3xl text-text-primary">{value}</p>
      <div className="mt-3 flex h-1 overflow-hidden rounded-full bg-background">
        {distribution.map((d, i) =>
          d.value > 0 ? (
            <div
              key={i}
              style={{
                width: `${(d.value / total) * 100}%`,
                backgroundColor: d.color,
              }}
            />
          ) : null
        )}
      </div>
    </div>
  );
}

interface StatCardsProps {
  devices: Device[];
}

const ORDER: Array<{ status: Device['status'] }> = [
  { status: 'ON' },
  { status: 'OFF' },
  { status: 'ERROR' },
  { status: 'DISCONNECTED' },
];

/** Stat cards + a status distribution bar for the active floor. */
export function StatCards({ devices }: StatCardsProps) {
  const counts: Record<Device['status'], number> = { ON: 0, OFF: 0, ERROR: 0, DISCONNECTED: 0 };
  for (const d of devices) counts[d.status] += 1;

  const distribution = ORDER.map(({ status }) => ({
    value: counts[status],
    color: STATUS_COLORS[status],
  }));

  const total = devices.length;
  const faults = counts.ERROR + counts.DISCONNECTED;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Devices" value={total} accent={STATUS_COLORS.ON} distribution={distribution} />
      <StatCard label="On" value={counts.ON} accent={STATUS_COLORS.ON} distribution={distribution} />
      <StatCard label="Off" value={counts.OFF} accent={STATUS_COLORS.OFF} distribution={distribution} />
      <StatCard label="Faults" value={faults} accent={STATUS_COLORS.ERROR} distribution={distribution} />
    </div>
  );
}
