/**
 * PAGE CONTAINER COMPONENT
 * =========================
 * Consistent page wrapper with padding.
 * Works with sidebar layout - content fills available width.
 *
 * @update 2025-12-19 - Adapted for sidebar layout
 */

import { cn } from '@/lib/utils/cn';

// ============================================================================
// TYPES
// ============================================================================

export interface PageContainerProps {
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Optional max-width constraint (for non-sidebar pages like login) */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

// ============================================================================
// MAX WIDTH CLASSES
// ============================================================================

const maxWidthClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-full',
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Page container with consistent padding.
 * In sidebar layout, content fills available width naturally.
 *
 * @example Basic usage
 * <PageContainer>
 *   <PageHeader title="Dashboard" />
 *   <Content />
 * </PageContainer>
 *
 * @example With max-width (for centered content like login)
 * <PageContainer maxWidth="sm">
 *   <LoginForm />
 * </PageContainer>
 */
export function PageContainer({
  children,
  className,
  maxWidth,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        // Padding
        'px-6 py-8 lg:px-10 lg:py-10',
        // Max width (only if specified)
        maxWidth && [maxWidthClasses[maxWidth], 'mx-auto'],
        className
      )}
    >
      {children}
    </div>
  );
}
