/**
 * BUTTON COMPONENT
 * =================
 * Versatile button with multiple variants and sizes.
 * Based on shadcn/ui patterns.
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
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500
   disabled:pointer-events-none disabled:opacity-50`,
  {
    variants: {
      variant: {
        // Primary action button
        default: `bg-orange-500 text-white shadow-sm
                  hover:bg-orange-600 active:bg-orange-700`,

        // Secondary/subtle button
        secondary: `bg-stone-100 text-stone-900 shadow-sm
                    hover:bg-stone-200 active:bg-stone-300`,

        // Outline button
        outline: `border border-stone-300 bg-white text-stone-700
                  hover:bg-stone-50 hover:border-stone-400`,

        // Ghost/text button
        ghost: `text-stone-700 hover:bg-stone-100 hover:text-stone-900`,

        // Destructive action
        destructive: `bg-red-500 text-white shadow-sm
                      hover:bg-red-600 active:bg-red-700`,

        // Link style
        link: `text-orange-600 underline-offset-4 hover:underline`,
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
