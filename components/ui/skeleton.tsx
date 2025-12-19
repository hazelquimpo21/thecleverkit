/**
 * SKELETON COMPONENT
 * ===================
 * Loading placeholder with shimmer animation.
 * Uses shadcn/ui patterns with semantic color classes.
 */

import { cn } from '@/lib/utils/cn';

// ============================================================================
// COMPONENT
// ============================================================================

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Skeleton loading placeholder.
 *
 * @example
 * <Skeleton className="h-4 w-32" />
 * <Skeleton className="h-20 w-full" />
 */
function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
