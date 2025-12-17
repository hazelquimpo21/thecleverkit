/**
 * PAGE CONTAINER COMPONENT
 * =========================
 * Consistent page wrapper with max-width and padding.
 */

import { cn } from '@/lib/utils/cn';

// ============================================================================
// COMPONENT
// ============================================================================

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Page container with consistent max-width and padding.
 *
 * @example
 * <PageContainer>
 *   <h1>Page Title</h1>
 *   <p>Page content...</p>
 * </PageContainer>
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main className={cn('mx-auto max-w-6xl px-4 py-8', className)}>
      {children}
    </main>
  );
}
