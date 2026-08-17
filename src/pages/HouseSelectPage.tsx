import { Link } from 'react-router-dom';
import { useHouses } from '../hooks/useHouses';
import { DeviceNode } from '../components/DeviceCard';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { HouseCardSkeleton } from '../components/Skeleton';
import type { Device } from '../types';

const BOOT_NODE: Device = {
  deviceId: 'sim-0',
  type: 'outlet',
  label: '',
  gridX: 0,
  gridY: 0,
  status: 'ON',
  lastUpdatedAt: 0,
  lastUpdatedBy: 'system',
};

export function HouseSelectPage() {
  const { houses, loading } = useHouses();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <DeviceNode device={BOOT_NODE} size={36} />
          <div>
            <p className="font-display text-lg text-text-primary">Smart Home Control</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
              hardware simulator // v0.1
            </p>
          </div>
          <div className="ml-auto">
            <ConnectionBadge />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-text-muted">
          select a house to simulate
        </p>

        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <HouseCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {houses.map((house) => (
              <Link
                key={house.houseId}
                to={`/simulator/${house.houseId}`}
                className="group rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent-cyan"
              >
                <div className="-mx-5 -mt-5 mb-4 h-32 overflow-hidden rounded-t-lg border-b border-border bg-background">
                  {house.imageUrl ? (
                    <img
                      src={house.imageUrl}
                      alt={house.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
                      no image
                    </div>
                  )}
                </div>
                <p className="font-sans-semibold text-lg text-text-primary transition-colors group-hover:text-accent-cyan">
                  {house.name}
                </p>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                  enter simulator →
                </p>
              </Link>
            ))}
          </div>
        )}

        {!loading && houses.length === 0 ? (
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.16em] text-text-muted">
            no houses found — seed the realtime database first
          </p>
        ) : null}
      </main>
    </div>
  );
}
