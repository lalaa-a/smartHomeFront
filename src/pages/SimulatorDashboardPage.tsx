import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { DeviceType } from '../types';
import { useHouses } from '../hooks/useHouses';
import { useFloors } from '../hooks/useFloors';
import { useFloorDevices } from '../hooks/useFloorDevices';
import { DeviceCard } from '../components/DeviceCard';
import { FloorPlanView } from '../components/FloorPlanView';
import { StatCards } from '../components/StatCards';
import { StatusDonut } from '../components/StatusDonut';
import { UsageBars } from '../components/UsageBars';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { FloorTabs } from '../components/FloorTabs';
import { ErrorInjectorPanel } from '../components/ErrorInjectorPanel';
import { AlertToast } from '../components/AlertToast';
import { DeviceCardSkeleton, FloorTabsSkeleton, SkeletonBlock } from '../components/Skeleton';

export function SimulatorDashboardPage() {
  const { houseId = '' } = useParams<{ houseId: string }>();
  const navigate = useNavigate();

  const { houses } = useHouses();
  const house = houses.find((h) => h.houseId === houseId);

  const { floors, loading: floorsLoading } = useFloors(houseId);
  const [activeFloorId, setActiveFloorId] = useState<string | undefined>(undefined);
  const currentFloor = activeFloorId ?? floors[0]?.floorId;

  const { devices, loading } = useFloorDevices(houseId, currentFloor);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [showCones, setShowCones] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | DeviceType>('all');
  const selected = devices.find((d) => d.deviceId === selectedId) ?? null;

  const planDevices = typeFilter === 'all' ? devices : devices.filter((d) => d.type === typeFilter);

  const showConesToggle = planDevices.some((d) => d.type === 'camera' && d.direction != null);

  const selectFloor = (floorId: string) => {
    setActiveFloorId(floorId);
    setSelectedId(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="font-mono text-xs uppercase tracking-[0.16em] text-text-muted transition-colors hover:text-text-primary"
            >
              ← houses
            </Link>
            <h1 className="font-display text-xl text-text-primary">{house?.name ?? 'Simulator'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <ConnectionBadge />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              hardware simulator
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        {floorsLoading ? (
          <FloorTabsSkeleton />
        ) : (
          <FloorTabs floors={floors} activeFloorId={currentFloor} onSelect={selectFloor} />
        )}

        {loading ? (
          <SkeletonBlock className="mt-5 h-3 w-64 rounded-sm" />
        ) : (
          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-text-muted">
              {devices.length} device{devices.length === 1 ? '' : 's'} · click a card to target the
              injector, open → for detail
            </p>
            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | DeviceType)}
                className="rounded-sm border border-border bg-surface px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-text-primary outline-none transition-colors focus:border-accent-cyan"
              >
                <option value="all">all types</option>
                <option value="outlet">outlet</option>
                <option value="multiswitch">multi-sw</option>
                <option value="safety_slot">safety</option>
                <option value="camera">camera</option>
                <option value="light">light</option>
              </select>
              {showConesToggle ? (
                <button
                  type="button"
                  onClick={() => setShowCones((v) => !v)}
                  className={`rounded-sm border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                    showCones
                      ? 'border-accent-cyan bg-accent-cyan text-background'
                      : 'border-border text-text-muted hover:border-accent-cyan hover:text-accent-cyan'
                  }`}
                >
                  cones {showCones ? 'on' : 'off'}
                </button>
              ) : null}
            </div>
          </div>
        )}

        {!loading ? (
          <div className="mt-4">
            <FloorPlanView
              floor={floors.find((f) => f.floorId === currentFloor) ?? {
                floorId: currentFloor ?? '',
                name: '',
                gridWidth: 24,
                gridHeight: 16,
                order: 0,
              }}
              devices={planDevices}
              selectedId={selectedId}
              onSelectDevice={(device) => setSelectedId(device.deviceId)}
              onOpenDevice={(device) =>
                navigate(`/simulator/${houseId}/${currentFloor}/${device.deviceId}`)
              }
              showCones={showCones}
            />
          </div>
        ) : null}

        {!loading ? (
          <div className="mt-6">
            <StatCards devices={devices} />
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <StatusDonut devices={devices} />
              <UsageBars
                houseId={houseId}
                deviceIds={devices.map((d) => d.deviceId)}
                labels={Object.fromEntries(devices.map((d) => [d.deviceId, d.label]))}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }, (_, i) => <DeviceCardSkeleton key={i} />)
          ) : (
            devices.map((device) => (
              <DeviceCard
                key={device.deviceId}
                device={device}
                houseId={houseId}
                floorId={currentFloor ?? ''}
                selected={device.deviceId === selectedId}
                onSelect={() => setSelectedId(device.deviceId)}
                onOpen={() => navigate(`/simulator/${houseId}/${currentFloor}/${device.deviceId}`)}
              />
            ))
          )}
        </div>

        {!loading && devices.length === 0 ? (
          <p className="mt-10 font-mono text-xs uppercase tracking-[0.16em] text-text-muted">
            no devices on this floor — add one from the mobile app to see it here
          </p>
        ) : null}

        <div className="mt-6">
          <ErrorInjectorPanel houseId={houseId} floorId={currentFloor ?? ''} device={selected} />
        </div>
      </main>

      <AlertToast houseId={houseId} />
    </div>
  );
}
