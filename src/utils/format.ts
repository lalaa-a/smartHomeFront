export function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export function formatClock(timestamp: number): string {
  const d = new Date(timestamp);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatMinutes(ms: number): string {
  return formatDuration(ms);
}
