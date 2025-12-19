/**
 * EMPTY STATE COMPONENT
 * ======================
 * Reusable empty state display for when there's no data.
 * Provides a warm, inviting message with optional action.
 *
 * @created 2025-12-19 - Part of UI redesign
 */

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

// ============================================================================
// TYPES
// ============================================================================

export interface EmptyStateProps {
  /** Lucide icon component or custom icon element */
  icon?: React.ReactNode;
  /** Main heading text */
  title: string;
  /** Description text */
  description?: string;
  /** Action slot (typically a Button) */
  action?: React.ReactNode;
  /** Additional content below the action */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Empty state component for when there's no data to display.
 * Provides a friendly, informative message with optional CTA.
 *
 * @example Basic usage
 * <EmptyState
 *   icon={<Inbox className="h-8 w-8" />}
 *   title="No messages yet"
 *   description="When you receive messages, they'll appear here."
 * />
 *
 * @example With action
 * <EmptyState
 *   icon={<Plus className="h-8 w-8" />}
 *   title="No brands added"
 *   description="Add your first brand to get started."
 *   action={<Button>Add Brand</Button>}
 * />
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  children,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: 'py-8 gap-3',
    md: 'py-12 gap-4',
    lg: 'py-16 gap-5',
  };

  const iconSizes = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-4',
        sizeClasses[size],
        className
      )}
    >
      {/* Icon container */}
      {icon && (
        <div
          className={cn(
            'rounded-full bg-primary/10 text-primary',
            iconSizes[size]
          )}
        >
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className={cn('font-semibold text-foreground', titleSizes[size])}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-muted-foreground max-w-md text-sm">
          {description}
        </p>
      )}

      {/* Action */}
      {action && <div className="mt-2">{action}</div>}

      {/* Additional content */}
      {children && <div className="mt-6 w-full">{children}</div>}
    </div>
  );
}
