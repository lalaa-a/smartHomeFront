import { useConnectionStatus } from '../hooks/useConnectionStatus';
import { COLORS } from '../tokens';

/** Top-bar indicator driven by RTDB `.info/connected` — cyan when synced. */
export function ConnectionBadge() {
  const connected = useConnectionStatus();
  const color = connected ? COLORS.accentCyan : COLORS.danger;

  return (
    <span
      className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors"
      style={{ color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor: color,
          animation: connected
            ? 'device-pulse 2.2s ease-out infinite'
            : 'device-flicker 0.74s linear infinite',
        }}
      />
      {connected ? 'Synced' : 'Offline'}
    </span>
  );
}
