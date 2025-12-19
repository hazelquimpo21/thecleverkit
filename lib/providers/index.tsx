/**
 * PROVIDERS INDEX
 * =================
 * Central composition of all application providers.
 * Wraps children with all necessary context providers.
 */

'use client';

import { QueryProvider } from './query-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

// ============================================================================
// COMPONENT
// ============================================================================

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Composes all application providers in the correct order.
 *
 * Provider order (outer to inner):
 * 1. QueryProvider - React Query for server state
 * 2. TooltipProvider - Radix tooltip context
 * 3. Toaster - Toast notifications (rendered as sibling)
 *
 * @example
 * // In layout.tsx:
 * <Providers>
 *   <Header />
 *   {children}
 * </Providers>
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <TooltipProvider delayDuration={300}>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </TooltipProvider>
    </QueryProvider>
  );
}
