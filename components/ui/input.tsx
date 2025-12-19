/**
 * INPUT COMPONENT
 * =================
 * Text input with consistent styling.
 * Updated for 1960s science textbook aesthetic.
 *
 * @update 2025-12-19 - Updated styling for redesign
 *   - Warm shadows
 *   - Updated radius
 *   - Better focus states
 */

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

// ============================================================================
// TYPES
// ============================================================================

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Error message to display */
  error?: string;
  /** Optional label */
  label?: string;
  /** Optional hint text */
  hint?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Input component with error state support.
 *
 * @example Basic
 * <Input placeholder="Enter URL..." />
 *
 * @example With error
 * <Input type="email" error="Invalid email" />
 *
 * @example With label
 * <Input label="Website URL" placeholder="https://..." />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, hint, id, ...props }, ref) => {
    // Generate ID if not provided (for label association)
    const inputId = id || `input-${React.useId()}`;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            {label}
          </label>
        )}

        {/* Input */}
        <input
          id={inputId}
          type={type}
          className={cn(
            // Base styles
            `flex h-11 w-full rounded-[var(--radius-md)] bg-surface px-4 py-2
             text-base text-foreground shadow-warm-sm transition-all
             placeholder:text-foreground-subtle
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:shadow-warm-md
             disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-muted`,
            // Border state
            error
              ? 'border-2 border-[var(--error)] focus-visible:ring-[var(--error)]'
              : 'border border-border hover:border-border-strong',
            className
          )}
          ref={ref}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />

        {/* Error message */}
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-[var(--error)]">
            {error}
          </p>
        )}

        {/* Hint text */}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-foreground-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
