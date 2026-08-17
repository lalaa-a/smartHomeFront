import { useEffect } from 'react';
import { formatClock } from '../utils/format';
import type { CameraDevice } from '../types';
import { pushNewSnapshot } from '../services/deviceMirror';
import { InfoRow, SectionLabel } from './ui';
import { StatusChip } from './DeviceCard';

interface CameraFeedCardProps {
  houseId: string;
  floorId: string;
  device: CameraDevice;
  /** Seconds between pushed mock snapshots. */
  cycleSeconds?: number;
}

export function CameraFeedCard({
  houseId,
  floorId,
  device,
  cycleSeconds = 6,
}: CameraFeedCardProps) {
  useEffect(() => {
    const interval = setInterval(() => {
      void pushNewSnapshot(houseId, floorId, device.deviceId);
    }, cycleSeconds * 1000);
    return () => clearInterval(interval);
  }, [houseId, floorId, device.deviceId, cycleSeconds]);

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <SectionLabel>Camera feed</SectionLabel>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-accent-cyan">
            <span
              className="h-1.5 w-1.5 rounded-full bg-accent-cyan"
              style={{ animation: 'device-pulse 2.2s ease-out infinite' }}
            />
            live
          </span>
          <StatusChip device={device} />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        {device.snapshotUrl ? (
          <img
            key={device.snapshotUrl}
            src={device.snapshotUrl}
            alt={`Snapshot for ${device.label}`}
            className="fade-in aspect-video w-full bg-surface-raised object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-surface-raised">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-text-muted">
              no signal
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 border-t border-border pt-3">
        <InfoRow label="Stream" value={device.streamUri ?? 'rtsp://mock/live'} />
        <InfoRow label="Last snapshot" value={device.lastSnapshotAt ? formatClock(device.lastSnapshotAt) : '—'} />
      </div>
    </div>
  );
}
