/**
 * INPUT COMPONENT
 * =================
 * Text input with consistent styling.
 * Uses shadcn/ui patterns with semantic color classes.
 */

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

// ============================================================================
// COMPONENT
// ============================================================================

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Error message to display */
  error?: string;
}

/**
 * Input component with error state support.
 *
 * @example
 * <Input placeholder="Enter URL..." />
 * <Input type="email" error="Invalid email" />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            // Base styles
            `flex h-11 w-full rounded-lg border bg-background px-4 py-2
             text-base text-foreground shadow-sm transition-colors
             placeholder:text-muted-foreground
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
             disabled:cursor-not-allowed disabled:opacity-50`,
            // Error state
            error
              ? 'border-destructive focus-visible:ring-destructive'
              : 'border-input',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
