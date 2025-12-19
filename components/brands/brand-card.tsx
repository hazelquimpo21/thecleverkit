/**
 * BRAND CARD COMPONENT
 * =====================
 * Displays a brand in the dashboard list view.
 * Shows brand name, URL, status, and quick actions.
 *
 * Features:
 * - Clickable to navigate to brand profile
 * - Shows analysis status with badge
 * - Displays "Your Brand" star for user's own brand
 * - Dropdown menu for delete action
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, MoreHorizontal, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/brands/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePrefetchBrand } from '@/hooks/use-brands';
import { extractDomain, formatRelativeTime } from '@/lib/utils/format';
import type { BrandWithAnalyses, AnalysisStatus } from '@/types';
import type { ParsedBasics } from '@/types/analyzers';

// ============================================================================
// TYPES
// ============================================================================

interface BrandCardProps {
  /** The brand to display */
  brand: BrandWithAnalyses;
  /** Callback when delete is clicked */
  onDelete?: (brandId: string, brandName: string) => void;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Compute the overall analysis status from individual runs.
 * Priority: error > analyzing/parsing > queued > complete
 */
function computeOverallStatus(brand: BrandWithAnalyses): AnalysisStatus | 'pending' {
  const runs = brand.analysis_runs || [];

  // No runs yet = pending
  if (runs.length === 0) return 'pending';

  // Check for any errors
  const hasError = runs.some(r => r.status === 'error');
  if (hasError) return 'error';

  // Check for any in-progress
  const hasInProgress = runs.some(r => r.status === 'analyzing' || r.status === 'parsing');
  if (hasInProgress) return 'analyzing';

  // Check for any queued
  const hasQueued = runs.some(r => r.status === 'queued');
  if (hasQueued) return 'queued';

  // All complete
  const allComplete = runs.every(r => r.status === 'complete');
  if (allComplete && runs.length > 0) return 'complete';

  return 'pending';
}

/**
 * Extract display name from brand data.
 * Falls back through: brand.name -> parsed basics -> domain
 */
function getDisplayName(brand: BrandWithAnalyses): string {
  // First try the brand's stored name
  if (brand.name) return brand.name;

  // Then try parsed basics data
  const basicsRun = brand.analysis_runs?.find(r => r.analyzer_type === 'basics');
  const basicsData = basicsRun?.parsed_data as ParsedBasics | null;
  if (basicsData?.business_name) return basicsData.business_name;

  // Fall back to domain from URL
  return extractDomain(brand.source_url);
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Brand card for dashboard list.
 * Shows brand info with status and actions.
 *
 * @example
 * <BrandCard brand={brand} onDelete={handleDelete} />
 */
export function BrandCard({ brand, onDelete }: BrandCardProps) {
  const prefetchBrand = usePrefetchBrand();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = getDisplayName(brand);
  const overallStatus = computeOverallStatus(brand);
  const domain = extractDomain(brand.source_url);
  const updatedAt = formatRelativeTime(brand.updated_at);

  return (
    <Card className="group relative transition-all hover:shadow-md hover:border-primary/20">
      {/* Main clickable area */}
      <Link
        href={`/brands/${brand.id}`}
        onMouseEnter={() => prefetchBrand(brand.id)}
        className="block"
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            {/* Brand info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {/* Own brand star */}
                {brand.is_own_brand && (
                  <Star className="h-4 w-4 text-primary fill-primary flex-shrink-0" />
                )}

                {/* Brand name */}
                <h3 className="font-semibold text-foreground truncate">
                  {displayName}
                </h3>
              </div>

              {/* URL / Domain */}
              <p className="text-sm text-muted-foreground truncate mb-2">
                {domain}
              </p>

              {/* Status and time */}
              <div className="flex items-center gap-3">
                <StatusBadge status={overallStatus} />
                <span className="text-xs text-muted-foreground">
                  {updatedAt}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>

      {/* Actions menu - positioned absolute so it doesn't interfere with card click */}
      <div className="absolute top-3 right-3">
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <a
                href={brand.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
                Visit Website
              </a>
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled
              className="flex items-center gap-2 text-muted-foreground"
            >
              <RefreshCw className="h-4 w-4" />
              Re-analyze
              <span className="ml-auto text-xs">(Soon)</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="flex items-center gap-2 text-destructive focus:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onDelete?.(brand.id, displayName);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete Brand
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
