import { Link, useParams } from 'react-router-dom';
import { useHouses } from '../hooks/useHouses';
import { useFloors } from '../hooks/useFloors';
import { useFloorDevices } from '../hooks/useFloorDevices';
import { formatClock } from '../utils/format';
import { DeviceNode, StatusChip } from '../components/DeviceCard';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { MultiSwitchPanel } from '../components/MultiSwitchPanel';
import { SafetySlotCard } from '../components/SafetySlotCard';
import { CameraFeedCard } from '../components/CameraFeedCard';
import { ErrorInjectorPanel } from '../components/ErrorInjectorPanel';
import { AlertToast } from '../components/AlertToast';
import { Button, InfoRow, SectionLabel } from '../components/ui';
import { reflectPhysicalToggle } from '../services/deviceMirror';
import { SkeletonBlock } from '../components/Skeleton';
import type { CameraDevice, LightDevice, OutletDevice } from '../types';

function PowerControlCard({
  houseId,
  floorId,
  device,
}: {
  houseId: string;
  floorId: string;
  device: OutletDevice | LightDevice | CameraDevice;
}) {
  const on = device.status === 'ON';
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <SectionLabel>Power</SectionLabel>
      <Button
        label={on ? 'TURN OFF' : 'TURN ON'}
        variant={on ? 'secondary' : 'primary'}
        onClick={() => void reflectPhysicalToggle(houseId, floorId, device.deviceId, !on)}
        className="mt-5 w-full"
      />
      <div className="mt-5 border-t border-border pt-3">
        <InfoRow label="Last toggle" value={`${formatClock(device.lastUpdatedAt)} · ${device.lastUpdatedBy}`} />
      </div>
    </div>
  );
}

export function DeviceInspectorPage() {
  const { houseId = '', floorId = '', deviceId = '' } = useParams<{
    houseId: string;
    floorId: string;
    deviceId: string;
  }>();

  const { houses } = useHouses();
  const house = houses.find((h) => h.houseId === houseId);
  const { floors } = useFloors(houseId);
  const floor = floors.find((f) => f.floorId === floorId);
  const { devices, loading } = useFloorDevices(houseId, floorId);
  const device = devices.find((d) => d.deviceId === deviceId) ?? null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <Link
            to={`/simulator/${houseId}`}
            className="font-mono text-xs uppercase tracking-[0.16em] text-text-muted transition-colors hover:text-text-primary"
          >
            ← dashboard
          </Link>
          <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
            <span>{house?.name ?? houseId}</span>
            <span>·</span>
            <span>{floor?.name ?? floorId}</span>
            <span>·</span>
            <span className="text-accent-cyan">{device?.label ?? deviceId}</span>
          </div>
          <div className="ml-auto">
            <ConnectionBadge />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {loading ? (
          <div className="py-24 text-center">
            <SkeletonBlock className="mx-auto h-16 w-16 rounded-full" />
            <SkeletonBlock className="mx-auto mt-6 h-4 w-56 rounded-sm" />
            <SkeletonBlock className="mx-auto mt-3 h-3 w-40 rounded-sm" />
          </div>
        ) : device ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex items-center gap-5">
                <DeviceNode device={device} size={96} />
                <div>
                  <h1 className="font-display text-3xl text-text-primary">{device.label}</h1>
                  <p className="mt-1 font-mono text-xs text-text-muted">
                    {floor?.name}
                  </p>
                </div>
              </div>
              <StatusChip device={device} />
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {device.type === 'multiswitch' ? (
                <MultiSwitchPanel houseId={houseId} floorId={floorId} device={device} />
              ) : null}
              {device.type === 'safety_slot' ? (
                <SafetySlotCard houseId={houseId} floorId={floorId} device={device} />
              ) : null}
              {device.type === 'camera' ? (
                <CameraFeedCard houseId={houseId} floorId={floorId} device={device} />
              ) : null}
              {(device.type === 'outlet' ||
                device.type === 'light' ||
                device.type === 'camera') ? (
                <PowerControlCard houseId={houseId} floorId={floorId} device={device} />
              ) : null}
            </div>

            <div className="mt-5">
              <ErrorInjectorPanel houseId={houseId} floorId={floorId} device={device} />
            </div>
          </>
        ) : (
          <div className="py-24 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-text-muted">
              device not found on this floor
            </p>
            <Link
              to={`/simulator/${houseId}`}
              className="mt-4 inline-block font-mono text-xs uppercase tracking-[0.16em] text-accent-cyan"
            >
              ← back to dashboard
            </Link>
          </div>
        )}
      </main>

      <AlertToast houseId={houseId} />
    </div>
  );
}
