import { useCountdown } from '../hooks/useCountdown';
import { formatClock, formatDuration } from '../utils/format';
import type { SafetySlotDevice } from '../types';
import { reflectPhysicalToggle } from '../services/deviceMirror';
import { Button, InfoRow, SectionLabel } from './ui';
import { CountdownRing } from './CountdownRing';
import { StatusChip } from './DeviceCard';
import { COLORS } from '../tokens';

interface SafetySlotCardProps {
  houseId: string;
  floorId: string;
  device: SafetySlotDevice;
}

export function SafetySlotCard({ houseId, floorId, device }: SafetySlotCardProps) {
  const { progress, remainingMs } = useCountdown(device.turnedOnAt, device.maxOnDurationMinutes);
  const on = device.status === 'ON';
  const drained = on && progress <= 0.2;
  const ringColor = drained ? COLORS.danger : COLORS.accentAmber;

  const arm = () =>
    void reflectPhysicalToggle(houseId, floorId, device.deviceId, true, {
      turnedOnAt: Date.now(),
      autoOffTriggered: false,
    });

  const forceOff = () =>
    void reflectPhysicalToggle(houseId, floorId, device.deviceId, false, {
      autoOffTriggered: false,
    });

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <SectionLabel>Safety slot</SectionLabel>
        <StatusChip device={device} />
      </div>

      <div className="mt-8 flex items-center justify-center">
        <div
          className="relative flex items-center justify-center"
          style={{ width: 144, height: 144 }}
        >
          <CountdownRing progress={on ? progress : 1} size={144} strokeWidth={4} />
          <div className="absolute flex flex-col items-center">
            <span className="font-display text-2xl" style={{ color: ringColor }}>
              {on ? formatDuration(remainingMs) : '—:—'}
            </span>
            <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
              remaining
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-4">
        <InfoRow label="Max on duration" value={formatDuration(device.maxOnDurationMinutes * 60_000)} />
        <InfoRow label="Turned on at" value={device.turnedOnAt ? formatClock(device.turnedOnAt) : '—'} />
        <InfoRow label="Updated" value={`${formatClock(device.lastUpdatedAt)} · ${device.lastUpdatedBy}`} />
      </div>

      <div className="mt-6 flex gap-3">
        <Button label="ARM" variant="primary" onClick={arm} disabled={on} className="flex-1" />
        <Button
          label="FORCE OFF"
          variant="danger"
          onClick={forceOff}
          disabled={!on}
          className="flex-1"
        />
      </div>

      {device.autoOffTriggered ? (
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-danger">
          auto-off engaged by server safety policy
        </p>
      ) : null}
    </div>
  );
}
