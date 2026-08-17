import type { MultiSwitchDevice } from '../types';
import { reflectSwitch } from '../services/deviceMirror';
import { SectionLabel } from './ui';
import { COLORS } from '../tokens';

interface MultiSwitchPanelProps {
  houseId: string;
  floorId: string;
  device: MultiSwitchDevice;
}

export function MultiSwitchPanel({ houseId, floorId, device }: MultiSwitchPanelProps) {
  const switches = Object.entries(device.switches ?? {});

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <SectionLabel>Switches</SectionLabel>
      {switches.length === 0 ? (
        <p className="mt-3 font-mono text-xs text-text-muted">no switches configured</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {switches.map(([switchId, sw]) => {
            const on = sw.status === 'ON';
            return (
              <div
                key={switchId}
                className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors"
                style={{ borderColor: on ? COLORS.accentAmber : COLORS.border }}
              >
                <span className="font-sans text-base text-text-primary">{sw.label}</span>
                <button
                  type="button"
                  onClick={() => void reflectSwitch(houseId, floorId, device.deviceId, switchId, !on)}
                  className={`rounded-sm border px-3 py-1 font-mono text-xs transition-colors ${
                    on
                      ? 'border-accent-amber bg-accent-amber text-background'
                      : 'border-border bg-transparent text-text-muted hover:text-text-primary'
                  }`}
                >
                  {on ? 'ON' : 'OFF'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
