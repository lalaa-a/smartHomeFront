import { useState } from 'react';
import { formatClock } from '../utils/format';
import type { Device } from '../types';
import {
  clearFault,
  injectDisconnect,
  injectError,
  pushNewSnapshot,
  triggerSafetyCutoff,
} from '../services/deviceMirror';
import { Button, SectionLabel } from './ui';

interface ErrorInjectorPanelProps {
  houseId: string;
  floorId: string;
  device: Device | null;
}

export function ErrorInjectorPanel({ houseId, floorId, device }: ErrorInjectorPanelProps) {
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  const fire = (action: () => Promise<void>, label: string) => () => {
    setLastEvent(`${label} · ${formatClock(Date.now())}`);
    void action().catch((err) => console.warn('[simulator] inject failed', err));
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-4">
        <SectionLabel>Error injector</SectionLabel>
        {lastEvent ? (
          <span className="font-mono text-[10px] text-text-muted">{lastEvent}</span>
        ) : null}
      </div>

      {device ? (
        <>
          <div className="mt-3">
            <p className="font-sans-semibold text-base text-text-primary">{device.label}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              label="TRIGGER ERROR"
              variant="danger"
              onClick={fire(() => injectError(houseId, floorId, device.deviceId), 'ERROR')}
            />
            <Button
              label="DISCONNECT"
              variant="warning"
              onClick={fire(() => injectDisconnect(houseId, floorId, device.deviceId), 'DISCONNECT')}
            />
            {device.type === 'safety_slot' ? (
              <Button
                label="SAFETY CUTOFF"
                variant="danger-solid"
                onClick={fire(
                  () =>
                    triggerSafetyCutoff(
                      houseId,
                      floorId,
                      device.deviceId,
                      `Safety cutoff triggered — ${device.label} force-turned-off.`
                    ),
                  'CUTOFF'
                )}
              />
            ) : null}
            {device.type === 'camera' ? (
              <Button
                label="PUSH SNAPSHOT"
                variant="primary"
                onClick={fire(() => pushNewSnapshot(houseId, floorId, device.deviceId), 'SNAPSHOT')}
              />
            ) : null}
            <Button
              label="CLEAR FAULT"
              variant="secondary"
              onClick={fire(() => clearFault(houseId, floorId, device.deviceId), 'CLEAR')}
            />
          </div>
        </>
      ) : (
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-text-muted">
          select a device card to inject faults
        </p>
      )}
    </div>
  );
}
