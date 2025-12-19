/**
 * SIDEBAR BRAND ITEM COMPONENT
 * =============================
 * Brand list item for the sidebar navigation.
 * Shows brand name with analysis status indicator.
 *
 * @created 2025-12-19 - Part of sidebar navigation redesign
 */

'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { extractDomain } from '@/lib/utils/format';
import type { BrandWithAnalyses } from '@/types';
import type { ParsedBasics } from '@/types/analyzers';

// ============================================================================
// TYPES
// ============================================================================

export interface SidebarBrandItemProps {
  /** The brand to display */
  brand: BrandWithAnalyses;
  /** Whether this brand is currently active/selected */
  active?: boolean;
  /** Optional callback to prefetch brand data on hover */
  onHover?: () => void;
}

type BrandStatus = 'complete' | 'analyzing' | 'error' | 'pending';

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Determine the overall status of a brand based on its analysis runs.
 */
function getBrandStatus(brand: BrandWithAnalyses): BrandStatus {
  const runs = brand.analysis_runs || [];

  if (runs.length === 0) {
    return 'pending';
  }

  // Check for any errors
  const hasError = runs.some(r => r.status === 'error');
  if (hasError) {
    return 'error';
  }

  // Check if any are still analyzing
  const isAnalyzing = runs.some(
    r => r.status === 'queued' || r.status === 'analyzing' || r.status === 'parsing'
  );
  if (isAnalyzing) {
    return 'analyzing';
  }

  // All complete
  return 'complete';
}

/**
 * Get display name for a brand.
 * Priority: brand.name > parsed business_name > domain
 */
function getBrandDisplayName(brand: BrandWithAnalyses): string {
  // Check if we have a manual name
  if (brand.name) {
    return brand.name;
  }

  // Try to get business_name from basics analyzer
  const basicsRun = brand.analysis_runs?.find(r => r.analyzer_type === 'basics');
  if (basicsRun?.status === 'complete' && basicsRun.parsed_data) {
    const basicsData = basicsRun.parsed_data as ParsedBasics;
    if (basicsData.business_name) {
      return basicsData.business_name;
    }
  }

  // Fall back to domain
  return extractDomain(brand.source_url);
}

// ============================================================================
// STATUS INDICATOR
// ============================================================================

interface StatusIndicatorProps {
  status: BrandStatus;
}

/**
 * Small status dot indicator.
 */
function StatusIndicator({ status }: StatusIndicatorProps) {
  const statusClasses: Record<BrandStatus, string> = {
    complete: 'bg-[var(--success)]',
    analyzing: 'bg-[var(--warning)] animate-pulse-soft',
    error: 'bg-[var(--error)]',
    pending: 'bg-[var(--border-strong)]',
  };

  return (
    <span
      className={cn(
        'h-2 w-2 rounded-full shrink-0',
        statusClasses[status]
      )}
      aria-label={`Status: ${status}`}
    />
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Sidebar brand list item with status indicator.
 * Navigates to the brand profile page when clicked.
 *
 * @example
 * <SidebarBrandItem
 *   brand={brand}
 *   active={currentBrandId === brand.id}
 *   onHover={() => prefetchBrand(brand.id)}
 * />
 */
export function SidebarBrandItem({
  brand,
  active = false,
  onHover,
}: SidebarBrandItemProps) {
  const status = getBrandStatus(brand);
  const displayName = getBrandDisplayName(brand);

  return (
    <Link
      href={`/brands/${brand.id}`}
      onMouseEnter={onHover}
      className={cn(
        // Layout
        'flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)]',
        // Typography
        'text-sm',
        // Transitions
        'transition-all duration-150',
        // States
        active
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-foreground-muted hover:bg-surface-muted hover:text-foreground'
      )}
    >
      <StatusIndicator status={status} />
      <span className="truncate flex-1">{displayName}</span>
    </Link>
  );
}
