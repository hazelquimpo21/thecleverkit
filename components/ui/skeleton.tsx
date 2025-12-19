/**
 * SKELETON COMPONENT
 * ===================
 * Loading placeholder with shimmer animation.
 * Uses warm gradient animation matching the design system.
 *
 * @update 2025-12-19 - Updated to use animate-shimmer for warm feel
 */

import { cn } from '@/lib/utils/cn';

// ============================================================================
// TYPES
// ============================================================================

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Variant for different use cases */
  variant?: 'default' | 'circular' | 'text';
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Skeleton loading placeholder with warm shimmer animation.
 *
 * @example Basic
 * <Skeleton className="h-4 w-32" />
 *
 * @example Card skeleton
 * <Skeleton className="h-20 w-full rounded-[var(--radius-lg)]" />
 *
 * @example Circular (avatar)
 * <Skeleton variant="circular" className="h-10 w-10" />
 */
function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  const variantClasses = {
    default: 'rounded-[var(--radius-md)]',
    circular: 'rounded-full',
    text: 'rounded',
  };

  return (
    <div
      className={cn(
        'animate-shimmer bg-surface-muted',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
