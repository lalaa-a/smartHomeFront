import type { CSSProperties } from 'react';

/**
 * Shimmer placeholder. Base color is the surface token; the moving highlight
 * is a surface-raised gradient defined in index.css (`.skeleton`).
 */
export function SkeletonBlock({
  className = '',
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <div className={`skeleton ${className}`} style={style} />;
}

/** Card-shaped placeholder matching the DeviceCard silhouette. */
export function DeviceCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start gap-4">
        <SkeletonBlock className="shrink-0 rounded-full" style={{ width: 56, height: 56 }} />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-3/4 rounded-sm" />
          <SkeletonBlock className="h-3 w-1/2 rounded-sm" />
          <SkeletonBlock className="h-3 w-2/3 rounded-sm" />
          <SkeletonBlock className="h-3 w-1/3 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

/** Placeholder for the floor tab bar. */
export function FloorTabsSkeleton() {
  return (
    <div className="flex items-end gap-2 border-b border-border pb-3">
      <SkeletonBlock className="h-8 w-24 rounded-sm" />
      <SkeletonBlock className="h-8 w-20 rounded-sm" />
      <SkeletonBlock className="h-8 w-28 rounded-sm" />
    </div>
  );
}

/** Placeholder for a house card on the house-select page. */
export function HouseCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <SkeletonBlock className="h-5 w-2/3 rounded-sm" />
      <SkeletonBlock className="mt-2 h-3 w-1/3 rounded-sm" />
      <SkeletonBlock className="mt-4 h-3 w-1/2 rounded-sm" />
    </div>
  );
}
