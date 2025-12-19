/**
 * ERROR STATE COMPONENT
 * ======================
 * Reusable error state display for when something goes wrong.
 * Provides a friendly message with optional retry action.
 *
 * @created 2025-12-19 - Part of UI redesign
 */

import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from './button';

// ============================================================================
// TYPES
// ============================================================================

export interface ErrorStateProps {
  /** Main heading text */
  title?: string;
  /** Description text explaining what went wrong */
  description?: string;
  /** The actual error object (for logging/debugging) */
  error?: Error | string | null;
  /** Retry callback */
  onRetry?: () => void;
  /** Whether retry is in progress */
  isRetrying?: boolean;
  /** Custom action instead of retry button */
  action?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Error state component for when something goes wrong.
 * Shows a friendly message with optional retry action.
 *
 * @example Basic usage
 * <ErrorState
 *   title="Failed to load"
 *   description="Please try again later."
 * />
 *
 * @example With retry
 * <ErrorState
 *   title="Connection lost"
 *   description="Unable to reach the server."
 *   onRetry={() => refetch()}
 *   isRetrying={isRefetching}
 * />
 */
export function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  error,
  onRetry,
  isRetrying = false,
  action,
  className,
  size = 'md',
}: ErrorStateProps) {
  const sizeClasses = {
    sm: 'py-6 gap-2',
    md: 'py-10 gap-3',
    lg: 'py-14 gap-4',
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // Extract error message if provided
  const errorMessage = error
    ? typeof error === 'string'
      ? error
      : error.message
    : null;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-4',
        sizeClasses[size],
        className
      )}
    >
      {/* Icon */}
      <div className="rounded-full bg-[var(--error-light)] p-3">
        <AlertCircle className={cn('text-[var(--error)]', iconSizes[size])} />
      </div>

      {/* Title */}
      <h3 className={cn('font-semibold text-foreground', titleSizes[size])}>
        {title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground max-w-md text-sm">{description}</p>

      {/* Error details (collapsed by default, shown in dev) */}
      {errorMessage && process.env.NODE_ENV === 'development' && (
        <code className="mt-2 text-xs text-muted-foreground bg-surface-muted px-2 py-1 rounded max-w-md truncate">
          {errorMessage}
        </code>
      )}

      {/* Action / Retry */}
      {action ? (
        <div className="mt-3">{action}</div>
      ) : onRetry ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-3"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Try again
            </>
          )}
        </Button>
      ) : null}
    </div>
  );
}
