/**
 * BADGE COMPONENT
 * =================
 * Small status indicators and labels.
 * Uses shadcn/ui patterns with semantic color classes.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

// ============================================================================
// VARIANTS
// ============================================================================

const badgeVariants = cva(
  // Base styles
  `inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5
   text-xs font-medium transition-colors`,
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'border-border text-foreground',
        // Extended variants for app-specific use cases
        success: 'border-transparent bg-success text-success-foreground',
        warning: 'border-transparent bg-warning text-warning-foreground',
        muted: 'border-transparent bg-muted text-muted-foreground',
        // Aliases for common use cases
        error: 'border-transparent bg-destructive text-destructive-foreground',
        info: 'border-transparent bg-blue-100 text-blue-700',
        // Orange brand accent variant
        orange: 'border-transparent bg-primary/10 text-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// ============================================================================
// COMPONENT
// ============================================================================

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge component for status and labels.
 *
 * @example
 * <Badge>Default</Badge>
 * <Badge variant="success">Complete</Badge>
 * <Badge variant="warning">In Progress</Badge>
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
