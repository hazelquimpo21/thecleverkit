/**
 * INPUT COMPONENT
 * =================
 * Text input with consistent styling.
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
            `flex h-11 w-full rounded-lg border bg-white px-4 py-2
             text-base text-stone-900 shadow-sm transition-colors
             placeholder:text-stone-400
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500
             disabled:cursor-not-allowed disabled:opacity-50`,
            // Error state
            error
              ? 'border-red-300 focus-visible:ring-red-500'
              : 'border-stone-300',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
