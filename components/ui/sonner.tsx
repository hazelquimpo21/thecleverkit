/**
 * SONNER (TOAST) COMPONENT
 * ==========================
 * Toast notifications using Sonner library.
 * Styled to match shadcn/ui design patterns.
 */

'use client';

import { Toaster as Sonner, toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

type ToasterProps = React.ComponentProps<typeof Sonner>;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Toast notification container.
 * Place this in your root layout once.
 *
 * @example
 * // In layout.tsx:
 * <Toaster />
 *
 * // In any component:
 * import { toast } from 'sonner';
 * toast.success('Brand analysis complete!');
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export { Toaster, toast };
