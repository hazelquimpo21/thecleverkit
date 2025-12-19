/**
 * BADGE COMPONENT
 * =================
 * Small status indicators and labels.
 * Includes semantic colors for analyzers and status.
 *
 * @update 2025-12-19 - Added analyzer semantic color variants
 *   - basics (sage green)
 *   - customer (dusty rose)
 *   - products (warm mustard)
 *   - docs (dusty teal)
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

// ============================================================================
// VARIANTS
// ============================================================================

const badgeVariants = cva(
  // Base styles - using --radius-sm for badges
  `inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 py-0.5
   text-xs font-medium transition-colors`,
  {
    variants: {
      variant: {
        // Default - primary brand color
        default: 'bg-primary text-primary-foreground',

        // Secondary - muted surface
        secondary: 'bg-surface-muted text-foreground-muted',

        // Outline - bordered
        outline: 'border border-border bg-transparent text-foreground',

        // Status colors
        success: 'bg-[var(--success-light)] text-[var(--success)]',
        warning: 'bg-[var(--warning-light)] text-[var(--foreground)]',
        error: 'bg-[var(--error-light)] text-[var(--error)]',
        info: 'bg-[var(--info-light)] text-[var(--info)]',

        // Destructive (alias for error)
        destructive: 'bg-[var(--error-light)] text-[var(--error)]',

        // Muted
        muted: 'bg-surface-muted text-foreground-muted',

        // === ANALYZER SEMANTIC COLORS ===

        // Basics analyzer - sage green
        basics: 'bg-[var(--color-basics-light)] text-[var(--color-basics)]',

        // Customer analyzer - dusty rose
        customer: 'bg-[var(--color-customer-light)] text-[var(--color-customer)]',

        // Products analyzer - warm mustard
        products: 'bg-[var(--color-products-light)] text-[var(--color-products)]',

        // Docs - dusty teal
        docs: 'bg-[var(--color-docs-light)] text-[var(--color-docs)]',

        // Primary accent (light background)
        accent: 'bg-primary/10 text-primary',
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
    VariantProps<typeof badgeVariants> {
  /** Optional dot indicator before text */
  dot?: boolean;
}

/**
 * Badge component for status and labels.
 *
 * @example Status badges
 * <Badge variant="success">Complete</Badge>
 * <Badge variant="warning">In Progress</Badge>
 *
 * @example Analyzer badges
 * <Badge variant="basics">Business Basics</Badge>
 * <Badge variant="customer">Customer Profile</Badge>
 * <Badge variant="products">Products & Pricing</Badge>
 *
 * @example With dot indicator
 * <Badge variant="success" dot>Active</Badge>
 */
function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current shrink-0"
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
