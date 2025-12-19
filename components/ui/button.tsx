/**
 * BUTTON COMPONENT
 * =================
 * Versatile button with multiple variants and sizes.
 * Updated for 1960s science textbook aesthetic.
 *
 * @update 2025-12-19 - Updated styling for redesign
 *   - Burnt sienna primary color
 *   - Warm shadows
 *   - Active scale effect
 *   - Updated border-radius
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

// ============================================================================
// VARIANTS
// ============================================================================

const buttonVariants = cva(
  // Base styles
  `inline-flex items-center justify-center gap-2 whitespace-nowrap
   rounded-[var(--radius-md)] text-sm font-medium
   transition-all duration-150
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
   disabled:pointer-events-none disabled:opacity-50
   active:scale-[0.98]
   [&_svg]:pointer-events-none [&_svg]:shrink-0`,
  {
    variants: {
      variant: {
        // Primary action - burnt sienna with warm shadow
        default: `bg-primary text-primary-foreground shadow-warm-sm
                  hover:bg-[var(--primary-hover)] hover:shadow-warm-md`,

        // Destructive action
        destructive: `bg-destructive text-destructive-foreground shadow-warm-sm
                      hover:bg-destructive/90`,

        // Secondary - surface with border
        secondary: `bg-surface border border-border text-foreground shadow-warm-sm
                    hover:bg-surface-muted`,

        // Outline button
        outline: `border border-border bg-transparent text-foreground
                  hover:bg-surface-muted`,

        // Ghost/text button
        ghost: `text-foreground-muted hover:bg-surface-muted hover:text-foreground`,

        // Link style
        link: `text-primary underline-offset-4 hover:underline`,

        // Success variant for positive actions
        success: `bg-success text-success-foreground shadow-warm-sm
                  hover:bg-success/90`,
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-4 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// ============================================================================
// COMPONENT
// ============================================================================

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Show loading spinner and disable button */
  isLoading?: boolean;
  /** Text to show when loading */
  loadingText?: string;
  /** Render as child component (for composition with Link, etc.) */
  asChild?: boolean;
}

/**
 * Button component with variants for different use cases.
 *
 * @example
 * <Button>Click me</Button>
 * <Button variant="secondary">Cancel</Button>
 * <Button isLoading loadingText="Saving...">Save</Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      loadingText,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
