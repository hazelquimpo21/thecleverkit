/**
 * CARD COMPONENT
 * ===============
 * Card container with header, content, and footer sections.
 * Uses warm shadows instead of borders for a 1960s textbook feel.
 *
 * @update 2025-12-19 - Updated styling for redesign
 *   - Removed border, uses warm shadow instead
 *   - Updated border-radius to use design system
 *   - Added hover lift effect for interactive cards
 */

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

// ============================================================================
// CARD ROOT
// ============================================================================

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Enable hover lift effect for clickable cards */
  interactive?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Base styling
        'rounded-[var(--radius-lg)] bg-card text-card-foreground',
        // Shadow instead of border
        'shadow-warm-sm',
        // Interactive hover state
        interactive && [
          'transition-all duration-150',
          'hover:shadow-warm-md hover:-translate-y-0.5',
          'cursor-pointer',
        ],
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

// ============================================================================
// CARD HEADER
// ============================================================================

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

// ============================================================================
// CARD TITLE
// ============================================================================

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-tight tracking-tight text-foreground',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

// ============================================================================
// CARD DESCRIPTION
// ============================================================================

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

// ============================================================================
// CARD CONTENT
// ============================================================================

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

// ============================================================================
// CARD FOOTER
// ============================================================================

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-5 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// ============================================================================
// EXPORTS
// ============================================================================

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
