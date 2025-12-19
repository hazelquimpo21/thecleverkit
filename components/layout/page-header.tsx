/**
 * PAGE HEADER COMPONENT
 * ======================
 * Consistent page header with title, subtitle, back navigation, and tabs.
 * Used at the top of each page for clear hierarchy and navigation.
 *
 * @created 2025-12-19 - Part of UI redesign
 */

'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ============================================================================
// TYPES
// ============================================================================

export interface PageHeaderTab {
  /** Tab identifier */
  value: string;
  /** Display label */
  label: string;
  /** Optional badge content */
  badge?: number | string;
}

export interface PageHeaderBackLink {
  /** Destination URL */
  href: string;
  /** Link text */
  label: string;
}

export interface PageHeaderProps {
  /** Page title (required) */
  title: string;
  /** Page subtitle or description */
  subtitle?: string;
  /** Back navigation link */
  backLink?: PageHeaderBackLink;
  /** Actions slot (buttons, menus) */
  actions?: React.ReactNode;
  /** Tab navigation */
  tabs?: PageHeaderTab[];
  /** Currently active tab value */
  activeTab?: string;
  /** Tab change handler */
  onTabChange?: (tab: string) => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// TAB COMPONENT
// ============================================================================

interface TabButtonProps {
  tab: PageHeaderTab;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ tab, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        // Layout
        'relative px-1 py-3',
        // Typography
        'text-sm font-medium',
        // Transitions
        'transition-colors duration-150',
        // States
        isActive
          ? 'text-primary'
          : 'text-foreground-muted hover:text-foreground'
      )}
    >
      <span className="flex items-center gap-2">
        {tab.label}
        {tab.badge !== undefined && (
          <span
            className={cn(
              'text-xs px-1.5 py-0.5 rounded-full',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'bg-surface-muted text-foreground-muted'
            )}
          >
            {tab.badge}
          </span>
        )}
      </span>

      {/* Active indicator bar */}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
      )}
    </button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Page header with title, optional subtitle, back navigation, and tabs.
 *
 * @example Basic usage
 * <PageHeader title="Your Brands" />
 *
 * @example With back link and actions
 * <PageHeader
 *   backLink={{ href: '/dashboard', label: 'Back to Dashboard' }}
 *   title="Acme Corporation"
 *   subtitle="https://acme.com"
 *   actions={<Button>Edit</Button>}
 * />
 *
 * @example With tabs
 * <PageHeader
 *   title="Brand Profile"
 *   tabs={[
 *     { value: 'overview', label: 'Overview' },
 *     { value: 'docs', label: 'Documents', badge: 3 },
 *   ]}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 * />
 */
export function PageHeader({
  title,
  subtitle,
  backLink,
  actions,
  tabs,
  activeTab,
  onTabChange,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('mb-6', className)}>
      {/* Back Link */}
      {backLink && (
        <div className="mb-4">
          <Link
            href={backLink.href}
            className={cn(
              'inline-flex items-center gap-1.5 text-sm',
              'text-foreground-muted hover:text-foreground',
              'transition-colors duration-150'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            {backLink.label}
          </Link>
        </div>
      )}

      {/* Title Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold text-foreground truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-foreground-muted truncate">
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>

      {/* Tab Navigation */}
      {tabs && tabs.length > 0 && (
        <div className="mt-6 flex items-center gap-6 border-b border-border">
          {tabs.map((tab) => (
            <TabButton
              key={tab.value}
              tab={tab}
              isActive={activeTab === tab.value}
              onClick={() => onTabChange?.(tab.value)}
            />
          ))}
        </div>
      )}
    </header>
  );
}
