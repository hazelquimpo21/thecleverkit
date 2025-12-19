/**
 * BUTTON COMPONENT
 * =================
 * Versatile button with multiple variants and sizes.
 * Uses shadcn/ui patterns with semantic color classes.
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
  `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg
   text-sm font-medium transition-all duration-200
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
   disabled:pointer-events-none disabled:opacity-50
   [&_svg]:pointer-events-none [&_svg]:shrink-0`,
  {
    variants: {
      variant: {
        // Primary action button
        default: `bg-primary text-primary-foreground shadow-sm
                  hover:bg-primary/90 active:bg-primary/80`,

        // Destructive action
        destructive: `bg-destructive text-destructive-foreground shadow-sm
                      hover:bg-destructive/90 active:bg-destructive/80`,

        // Outline button
        outline: `border border-input bg-background text-foreground shadow-sm
                  hover:bg-accent hover:text-accent-foreground`,

        // Secondary/subtle button
        secondary: `bg-secondary text-secondary-foreground shadow-sm
                    hover:bg-secondary/80`,

        // Ghost/text button
        ghost: `text-foreground hover:bg-accent hover:text-accent-foreground`,

        // Link style
        link: `text-primary underline-offset-4 hover:underline`,
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
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
