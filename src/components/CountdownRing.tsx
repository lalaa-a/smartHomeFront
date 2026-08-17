import { COLORS } from '../tokens';

interface CountdownRingProps {
  /** Remaining fraction in [0, 1]; 1 = full, 0 = drained. */
  progress: number;
  size?: number;
  strokeWidth?: number;
}

/**
 * Draining circular arc, clockwise from 12 o'clock. Stays amber down to the
 * final 20% of the countdown, then shifts to danger red — exactly like the
 * mobile safety-slot ring.
 */
export function CountdownRing({ progress, size = 56, strokeWidth = 2 }: CountdownRingProps) {
  const p = Math.min(1, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - p);
  const color = p <= 0.2 ? COLORS.danger : COLORS.accentAmber;

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: 'rotate(-90deg)' }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={COLORS.border}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashoffset}
      />
    </svg>
  );
}
