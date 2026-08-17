/**
 * Single source of truth for raw colors used outside Tailwind class strings
 * (dynamic SVG strokes, inline styles). Mirrors tailwind.config.js exactly.
 */
export const COLORS = {
  background: '#12161C',
  surface: '#1B212B',
  surfaceRaised: '#232B38',
  border: '#2C3444',
  textPrimary: '#EDEEF0',
  textMuted: '#8A93A3',
  textMutedStrong: '#5A6472',
  accentAmber: '#E8A33D',
  accentCyan: '#4FD1C5',
  danger: '#E85D4B',
  warning: '#F2C94C',
  success: '#6FCF97',
  nodeBorder: '#0A0D12',
} as const;
