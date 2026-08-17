import { useState } from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { formatClock, formatDuration } from '../utils/format';
import type { Device, DeviceStatus, DeviceType } from '../types';
import { STATUS_COLORS, TYPE_LABELS } from './status';
import { effectiveDeviceStatus } from '../utils/deviceStatus';
import { CountdownRing } from './CountdownRing';
import { clearFault, injectDisconnect, injectError, pushNewSnapshot } from '../services/deviceMirror';
import { COLORS } from '../tokens';

/** Per-type glyph rendered inside the status node (24×24 viewBox). */
export function DeviceGlyph({ type, size }: { type: DeviceType; size: number }) {
  const stroke = COLORS.nodeBorder;
  const sw = 1.8;
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    stroke,
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };
  return (
    <svg {...common}>
      {type === 'outlet' ? (
        <>
          <path d="M9 4v5M15 4v5" />
          <rect x="6.5" y="9" width="11" height="8" rx="2" />
        </>
      ) : type === 'multiswitch' ? (
        <>
          <rect x="4" y="6.5" width="16" height="5" rx="2.5" />
          <circle cx="16" cy="9" r="1.6" fill={stroke} stroke="none" />
          <rect x="4" y="14.5" width="16" height="5" rx="2.5" />
          <circle cx="8" cy="17" r="1.6" fill={stroke} stroke="none" />
        </>
      ) : type === 'safety_slot' ? (
        <path d="M12 4l7 2v6c0 4.2-3 6.8-7 8-4-1.2-7-3.8-7-8V6z" />
      ) : type === 'camera' ? (
        <>
          <path d="M8 8l2-3h4l2 3" />
          <rect x="3.5" y="8" width="17" height="11" rx="2" />
          <circle cx="12" cy="13.5" r="3.6" />
        </>
      ) : (
        <>
          <path d="M9 3.5h6a4.2 4.2 0 0 1 2 7.8c-.8.7-1.3 1.6-1.4 2.4H8.4c-.1-.8-.6-1.7-1.4-2.4A4.2 4.2 0 0 1 9 3.5z" />
          <path d="M10 16.5h4" />
        </>
      )}
    </svg>
  );
}

interface DeviceCardProps {
  device: Device;
  houseId: string;
  floorId: string;
  selected?: boolean;
  onSelect?: () => void;
  onOpen?: () => void;
}

/** The signature pulse-node visual, mirroring the mobile DeviceMarker states. */
export function DeviceNode({
  device,
  size = 56,
  progress,
}: {
  device: Device;
  size?: number;
  progress?: number;
}) {
  const isSafetyOn = device.type === 'safety_slot' && device.status === 'ON';
  const resolvedStatus = effectiveDeviceStatus(device);
  const color = STATUS_COLORS[resolvedStatus];
  const nodeSize = Math.round(size * 0.62);
  const nodeOffset = (size - nodeSize) / 2;
  const { progress: countdownProgress } = useCountdown(
    device.type === 'safety_slot' ? device.turnedOnAt : undefined,
    device.type === 'safety_slot' ? device.maxOnDurationMinutes : undefined
  );
  const ringProgress = progress ?? countdownProgress;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {resolvedStatus === 'ON' ? (
        <div
          className="device-pulse absolute inset-0 rounded-full border"
          style={{ borderColor: STATUS_COLORS.ON }}
        />
      ) : null}

      {resolvedStatus === 'DISCONNECTED' ? (
        <div
          className="absolute inset-0 rounded-full border-2 border-dashed"
          style={{ borderColor: STATUS_COLORS.DISCONNECTED, opacity: 0.4 }}
        />
      ) : null}

      {isSafetyOn ? <CountdownRing progress={ringProgress} size={size} strokeWidth={2} /> : null}

      <div
        className="absolute flex items-center justify-center rounded-full border border-background"
        style={{
          width: nodeSize,
          height: nodeSize,
          left: nodeOffset,
          top: nodeOffset,
          backgroundColor: color,
          opacity: resolvedStatus === 'DISCONNECTED' ? 0.4 : 1,
          animation:
            resolvedStatus === 'ERROR' ? 'device-flicker 0.74s linear infinite' : undefined,
        }}
      >
        <DeviceGlyph type={device.type} size={Math.round(nodeSize * 0.55)} />
      </div>
    </div>
  );
}

export function StatusChip({ status, device }: { status?: DeviceStatus; device?: Device }) {
  const resolved = device ? effectiveDeviceStatus(device) : (status as DeviceStatus);
  const color = STATUS_COLORS[resolved];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]"
      style={{ color, borderColor: color, backgroundColor: `${color}1A` }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor: color,
          animation:
            resolved === 'ERROR'
              ? 'device-flicker 0.74s linear infinite'
              : resolved === 'ON'
                ? 'device-pulse 2.2s ease-out infinite'
                : undefined,
        }}
      />
      {resolved}
    </span>
  );
}

type MenuTone = 'default' | 'danger' | 'warning' | 'cyan';

const MENU_TONES: Record<MenuTone, string> = {
  default: 'text-text-primary',
  danger: 'text-danger',
  warning: 'text-warning',
  cyan: 'text-accent-cyan',
};

function MenuItem({
  label,
  tone = 'default',
  onSelect,
}: {
  label: string;
  tone?: MenuTone;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`w-full rounded-sm px-3 py-2 text-left font-sans-medium text-sm transition-colors hover:bg-surface ${MENU_TONES[tone]}`}
    >
      {label}
    </button>
  );
}

export function DeviceCard({
  device,
  houseId,
  floorId,
  selected = false,
  onSelect,
  onOpen,
}: DeviceCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isSafetyOn = device.type === 'safety_slot' && device.status === 'ON';
  const { progress, remainingMs } = useCountdown(
    device.type === 'safety_slot' ? device.turnedOnAt : undefined,
    device.type === 'safety_slot' ? device.maxOnDurationMinutes : undefined
  );

  const closeMenu = () => setMenuOpen(false);

  const run = (action: () => Promise<void>) => () => {
    closeMenu();
    void action().catch((err) => console.warn('[simulator] inject failed', err));
  };

  return (
    <div
      className={`relative rounded-lg border bg-surface p-4 transition-colors ${
        selected ? 'border-accent-cyan' : 'border-border'
      } ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={onSelect}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      <div className="flex items-start gap-4">
        <DeviceNode device={device} size={56} progress={progress} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-sans-semibold text-base text-text-primary">
              {device.label}
            </p>
            <div className="flex shrink-0 items-center gap-1.5">
              <StatusChip device={device} />
              <div className="relative">
                <button
                  type="button"
                  aria-label={`Actions for ${device.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((open) => !open);
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <circle cx="3" cy="8" r="1.5" />
                    <circle cx="8" cy="8" r="1.5" />
                    <circle cx="13" cy="8" r="1.5" />
                  </svg>
                </button>

                {menuOpen ? (
                  <>
                    <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); closeMenu(); }} />
                    <div className="absolute right-0 top-full z-30 mt-1 w-52 rounded-lg border border-border bg-surface-raised p-1">
                      <MenuItem
                        label="Simulate ERROR"
                        tone="danger"
                        onSelect={run(() => injectError(houseId, floorId, device.deviceId))}
                      />
                      <MenuItem
                        label="Simulate DISCONNECT"
                        tone="warning"
                        onSelect={run(() => injectDisconnect(houseId, floorId, device.deviceId))}
                      />
                      {device.type === 'camera' ? (
                        <MenuItem
                          label="Push new snapshot"
                          tone="cyan"
                          onSelect={run(() => pushNewSnapshot(houseId, floorId, device.deviceId))}
                        />
                      ) : null}
                      <MenuItem
                        label="Restore"
                        onSelect={run(() => clearFault(houseId, floorId, device.deviceId))}
                      />
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
            {TYPE_LABELS[device.type]}
          </p>

          {isSafetyOn ? (
            <p
              className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-accent-amber"
              style={{ color: progress <= 0.2 ? COLORS.danger : COLORS.accentAmber }}
            >
              ttl {formatDuration(remainingMs)}
            </p>
          ) : null}

          {device.type === 'camera' && device.lastSnapshotAt ? (
            <p className="mt-1 font-mono text-[10px] text-accent-cyan">snap {formatClock(device.lastSnapshotAt)}</p>
          ) : null}

          <p className="mt-1 font-mono text-[10px] text-text-muted">
            upd {device.lastUpdatedBy} · {formatClock(device.lastUpdatedAt)}
          </p>
        </div>

        {onOpen ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="rounded-sm border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-accent-cyan transition-colors hover:border-accent-cyan"
          >
            open
          </button>
        ) : null}
      </div>
    </div>
  );
}
