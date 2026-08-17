import { useState } from 'react';
import type { Device, Floor } from '../types';
import { DeviceNode } from './DeviceCard';
import { COLORS } from '../tokens';

const MARKER_SIZE = 44;
const GRID_LINE = `${COLORS.border}66`;
const CONE_HALF_ANGLE = (30 * Math.PI) / 180;

/** Vision cone polygon (apex at the camera) in 0-100 percent space for the SVG viewBox. */
function conePolygon(cols: number, rows: number, gx: number, gy: number, angleDeg: number) {
  const angle = (angleDeg * Math.PI) / 180;
  const length = Math.max(cols, rows) * 0.6;
  const dir = (offset: number) => {
    const a = angle + offset;
    return [Math.sin(a), -Math.cos(a)] as const;
  };
  const [ex, ey] = dir(-CONE_HALF_ANGLE);
  const [fx, fy] = dir(CONE_HALF_ANGLE);
  const px = (v: number) => (v / cols) * 100;
  const py = (v: number) => (v / rows) * 100;
  return [
    [px(gx), py(gy)],
    [px(gx + length * ex), py(gy + length * ey)],
    [px(gx + length * fx), py(gy + length * fy)],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ');
}

interface FloorPlanViewProps {
  floor: Floor;
  devices: Device[];
  selectedId?: string;
  onSelectDevice?: (device: Device) => void;
  onOpenDevice?: (device: Device) => void;
  showCones?: boolean;
}

/**
 * The blueprint canvas, mirroring the mobile FloorGridOverlay: faint grid
 * lines under the floor plan image with device nodes positioned by gridX/gridY.
 */
export function FloorPlanView({
  floor,
  devices,
  selectedId,
  onSelectDevice,
  onOpenDevice,
  showCones = true,
}: FloorPlanViewProps) {
  const cols = Math.max(1, Number(floor.gridWidth) || 1);
  const rows = Math.max(1, Number(floor.gridHeight) || 1);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * cols);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * rows);
    setHover({ x: Math.max(0, Math.min(x, cols - 1)), y: Math.max(0, Math.min(y, rows - 1)) });
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg border border-border bg-background"
      style={{ aspectRatio: cols / rows }}
      onMouseMove={handleMove}
      onMouseLeave={() => setHover(null)}
    >
      {floor.planImageUrl ? (
        <img
          src={floor.planImageUrl}
          alt={floor.name}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: 0.92 }}
        />
      ) : null}

      {Array.from({ length: cols + 1 }, (_, i) => (
        <div
          key={`v-${i}`}
          className="absolute top-0 h-full w-px"
          style={{ left: `${(i / cols) * 100}%`, backgroundColor: GRID_LINE }}
        />
      ))}
      {Array.from({ length: rows + 1 }, (_, i) => (
        <div
          key={`h-${i}`}
          className="absolute left-0 h-px w-full"
          style={{ top: `${(i / rows) * 100}%`, backgroundColor: GRID_LINE }}
        />
      ))}

      {/* Hovered cell highlight */}
      {hover ? (
        <div
          className="pointer-events-none absolute"
          style={{
            left: `${(hover.x / cols) * 100}%`,
            top: `${(hover.y / rows) * 100}%`,
            width: `${(1 / cols) * 100}%`,
            height: `${(1 / rows) * 100}%`,
            backgroundColor: `${COLORS.accentCyan}1A`,
            border: `1px solid ${COLORS.accentCyan}66`,
          }}
        />
      ) : null}

      {showCones
        ? devices.map((device) => {
            if (device.type !== 'camera' || device.direction == null) return null;
            if (device.gridX == null || device.gridY == null) return null;
            const points = conePolygon(cols, rows, device.gridX, device.gridY, device.direction);
            return (
              <svg
                key={`cone-${device.deviceId}`}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 h-full w-full"
              >
                <polygon
                  points={points}
                  fill={`${COLORS.accentCyan}24`}
                  stroke={`${COLORS.accentCyan}99`}
                  strokeWidth={0.7}
                  strokeDasharray="3 2"
                />
              </svg>
            );
          })
        : null}

      {devices.map((device) => {
        const selected = device.deviceId === selectedId;
        return (
          <div
            key={device.deviceId}
            className="group absolute"
            style={{
              left: `${(device.gridX / cols) * 100}%`,
              top: `${(device.gridY / rows) * 100}%`,
              transform: `translate(-${MARKER_SIZE / 2}px, -${MARKER_SIZE / 2}px)`,
              zIndex: selected ? 10 : 1,
            }}
          >
            <button
              type="button"
              onClick={() => onSelectDevice?.(device)}
              onDoubleClick={() => onOpenDevice?.(device)}
              aria-label={device.label}
              className={`relative block cursor-pointer rounded-full transition-opacity ${
                selected
                  ? 'ring-2 ring-accent-cyan'
                  : 'opacity-90 hover:opacity-100'
              }`}
              style={{
                width: MARKER_SIZE,
                height: MARKER_SIZE,
              }}
            >
              <DeviceNode device={device} size={MARKER_SIZE} />
            </button>
            <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded-sm border border-border bg-surface-raised px-2 py-0.5 font-sans-medium text-[11px] text-text-primary group-hover:block">
              {device.label}
            </div>
          </div>
        );
      })}

      {/* Coordinate readout */}
      {hover ? (
        <div className="pointer-events-none absolute right-2 top-2 z-20 rounded-sm border border-border bg-surface-raised px-2 py-1 font-mono text-[11px] text-text-primary">
          ({hover.x}, {hover.y})
        </div>
      ) : null}
    </div>
  );
}
