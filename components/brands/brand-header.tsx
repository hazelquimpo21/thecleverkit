/**
 * BRAND HEADER COMPONENT
 * =======================
 * Displays brand name, URL, and status in a consistent header layout.
 * Used on the brand profile page.
 * Includes back link to dashboard for easy navigation.
 */

import Link from 'next/link';
import { ExternalLink, RefreshCw, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { extractDomain, formatRelativeTime } from '@/lib/utils/format';

// ============================================================================
// TYPES
// ============================================================================

interface BrandHeaderProps {
  /** Display name for the brand */
  displayName: string;
  /** Source URL that was analyzed */
  sourceUrl: string;
  /** When the brand was created */
  createdAt: string;
  /** Whether analysis is currently in progress */
  isAnalyzing: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Brand profile header with name, URL, and status badge.
 *
 * @example
 * <BrandHeader
 *   displayName="Acme Corp"
 *   sourceUrl="https://acme.com"
 *   createdAt="2024-01-15T10:00:00Z"
 *   isAnalyzing={false}
 * />
 */
export function BrandHeader({
  displayName,
  sourceUrl,
  createdAt,
  isAnalyzing,
}: BrandHeaderProps) {
  return (
    <div className="mb-8">
      {/* Back link to dashboard */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Brands
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {displayName}
          </h1>
          <div className="flex items-center gap-3">
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              {extractDomain(sourceUrl)}
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-border">•</span>
            <span className="text-sm text-muted-foreground">
              Added {formatRelativeTime(createdAt)}
            </span>
          </div>
        </div>

        {/* Status badge - shows when analyzing */}
        <div className="flex items-center gap-2">
          {isAnalyzing && (
            <Badge variant="info" className="animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin mr-1" />
              Analyzing...
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
