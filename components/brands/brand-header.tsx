/**
 * BRAND HEADER COMPONENT
 * =======================
 * Displays brand name, URL, and status in a consistent header layout.
 * Used on the brand profile page.
 */

import { ExternalLink, RefreshCw } from 'lucide-react';
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            {displayName}
          </h1>
          <div className="flex items-center gap-3">
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-stone-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
            >
              {extractDomain(sourceUrl)}
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-stone-300">•</span>
            <span className="text-sm text-stone-500">
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
