/**
 * BADGE COMPONENT
 * =================
 * Small status indicators and labels.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

// ============================================================================
// VARIANTS
// ============================================================================

const badgeVariants = cva(
  // Base styles
  `inline-flex items-center gap-1 rounded-full px-2.5 py-0.5
   text-xs font-medium transition-colors`,
  {
    variants: {
      variant: {
        default: 'bg-stone-100 text-stone-700',
        secondary: 'bg-stone-200 text-stone-800',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        error: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
        orange: 'bg-orange-100 text-orange-700',
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
