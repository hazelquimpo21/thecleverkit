/**
 * SIDEBAR NAV ITEM COMPONENT
 * ===========================
 * Reusable navigation link component for the sidebar.
 * Supports icons, active states, and optional badges.
 *
 * @created 2025-12-19 - Part of sidebar navigation redesign
 */

'use client';

import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ============================================================================
// TYPES
// ============================================================================

export interface SidebarNavItemProps {
  /** Navigation destination */
  href: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Link text label */
  label: string;
  /** Whether this item is currently active */
  active?: boolean;
  /** Optional badge content (e.g., count) */
  badge?: number | string;
  /** Additional CSS classes */
  className?: string;
  /** Click handler for non-link actions */
  onClick?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Sidebar navigation item with icon, label, and optional badge.
 *
 * @example
 * <SidebarNavItem
 *   href="/dashboard"
 *   icon={LayoutDashboard}
 *   label="Dashboard"
 *   active={pathname === '/dashboard'}
 * />
 *
 * @example with badge
 * <SidebarNavItem
 *   href="/settings"
 *   icon={Settings}
 *   label="Settings"
 *   badge={3}
 * />
 */
export function SidebarNavItem({
  href,
  icon: Icon,
  label,
  active = false,
  badge,
  className,
  onClick,
}: SidebarNavItemProps) {
  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
      {badge !== undefined && (
        <span
          className={cn(
            'ml-auto text-xs font-medium px-1.5 py-0.5 rounded-full',
            active
              ? 'bg-primary-foreground/20 text-primary-foreground'
              : 'bg-surface-muted text-foreground-muted'
          )}
        >
          {badge}
        </span>
      )}
    </>
  );

  const baseClasses = cn(
    // Layout
    'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]',
    // Typography
    'text-sm font-medium',
    // Transitions
    'transition-all duration-150',
    // States
    active
      ? 'bg-primary text-primary-foreground shadow-warm-sm'
      : 'text-foreground-muted hover:bg-surface-muted hover:text-foreground',
    className
  );

  // If onClick is provided, render as button
  if (onClick) {
    return (
      <button onClick={onClick} className={cn(baseClasses, 'w-full text-left')}>
        {content}
      </button>
    );
  }

  // Otherwise render as Link
  return (
    <Link href={href} className={baseClasses}>
      {content}
    </Link>
  );
}
