/**
 * SIDEBAR SECTION COMPONENT
 * ==========================
 * Section container for grouping sidebar items with a label.
 *
 * @created 2025-12-19 - Part of sidebar navigation redesign
 */

import { cn } from '@/lib/utils/cn';

// ============================================================================
// TYPES
// ============================================================================

export interface SidebarSectionProps {
  /** Section label (uppercase) */
  label?: string;
  /** Section contents */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Groups sidebar items under a labeled section.
 *
 * @example
 * <SidebarSection label="Brands">
 *   <SidebarBrandItem brand={brand1} />
 *   <SidebarBrandItem brand={brand2} />
 * </SidebarSection>
 */
export function SidebarSection({ label, children, className }: SidebarSectionProps) {
  return (
    <div className={cn('py-2', className)}>
      {label && (
        <h3 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
          {label}
        </h3>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
