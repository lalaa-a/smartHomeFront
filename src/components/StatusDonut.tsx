import type { Device } from '../types';
import { STATUS_COLORS } from './status';
import { COLORS } from '../tokens';

interface StatusDonutProps {
  devices: Device[];
}

const ORDER: Array<{ status: Device['status'] }> = [
  { status: 'ON' },
  { status: 'OFF' },
  { status: 'ERROR' },
  { status: 'DISCONNECTED' },
];

const RING_RADIUS = 44;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const SIZE = 120;

/** SVG donut of device status distribution with a legend. */
export function StatusDonut({ devices }: StatusDonutProps) {
  const counts: Record<Device['status'], number> = { ON: 0, OFF: 0, ERROR: 0, DISCONNECTED: 0 };
  for (const d of devices) counts[d.status] += 1;

  const total = devices.length || 1;
  const segments = ORDER.filter(({ status }) => counts[status] > 0);
  let cumulative = 0;

  return (
    <div className="flex items-center gap-6 rounded-lg border border-border bg-surface p-5">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke={COLORS.background}
            strokeWidth={12}
          />
          {segments.map(({ status }) => {
            const fraction = counts[status] / total;
            const dash = fraction * RING_CIRCUMFERENCE;
            const offset = -cumulative * RING_CIRCUMFERENCE;
            cumulative += fraction;
            return (
              <circle
                key={status}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke={STATUS_COLORS[status]}
                strokeWidth={12}
                strokeLinecap="butt"
                strokeDasharray={`${dash} ${RING_CIRCUMFERENCE - dash}`}
                strokeDashoffset={offset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-display text-2xl text-text-primary">{devices.length}</p>
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">devices</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {ORDER.map(({ status }) => (
          <div key={status} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[status] }}
              />
              {status}
            </span>
            <span className="font-mono text-xs text-text-primary">{counts[status]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
