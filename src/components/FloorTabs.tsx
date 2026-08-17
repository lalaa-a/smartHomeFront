import type { Floor } from '../types';

interface FloorTabsProps {
  floors: Floor[];
  activeFloorId?: string;
  onSelect: (floorId: string) => void;
}

export function FloorTabs({ floors, activeFloorId, onSelect }: FloorTabsProps) {
  if (floors.length === 0) {
    return (
      <div className="border-b border-border pb-3 font-mono text-xs uppercase tracking-[0.16em] text-text-muted">
        no floors on this house — add one from the mobile app
      </div>
    );
  }

  return (
    <div className="flex items-end gap-1 overflow-x-auto border-b border-border">
      {floors.map((floor) => {
        const active = floor.floorId === activeFloorId;
        return (
          <button
            key={floor.floorId}
            type="button"
            onClick={() => onSelect(floor.floorId)}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.16em] transition-colors ${
              active
                ? 'border-accent-amber text-accent-amber'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {floor.name}
          </button>
        );
      })}
    </div>
  );
}
