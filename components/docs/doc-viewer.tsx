/**
 * DOC VIEWER
 * ===========
 * Renders generated doc content in a readable format.
 * Displays structured content from Golden Circle and other templates.
 *
 * Features:
 * - Clean content rendering for each template type
 * - Freshness warning when brand data has changed
 * - Regenerate button for stale docs
 * - Smart export options (Open in Docs vs Export)
 * - Metadata footer with timestamps
 *
 * @created 2025-12-19 - Initial docs feature implementation
 * @updated 2025-12-19 - Added freshness detection, regenerate, smart export
 */

'use client';

import {
  X,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DocExportMenu } from './doc-export-menu';
import { isDocStale } from '@/lib/docs/state';
import type { GeneratedDoc, Brand } from '@/types';
import type { GoldenCircleContent } from '@/lib/docs/templates/golden-circle/types';

// ============================================================================
// TYPES
// ============================================================================

interface DocViewerProps {
  /** The generated doc to display */
  doc: GeneratedDoc;

  /** The brand (for freshness checking) */
  brand?: Brand;

  /** Callback when close button is clicked */
  onClose: () => void;

  /** Callback when regenerate is clicked (optional) */
  onRegenerate?: () => void;
}

// ============================================================================
// FRESHNESS BANNER
// ============================================================================

interface FreshnessBannerProps {
  isStale: boolean;
  isExported: boolean;
  onRegenerate?: () => void;
}

/**
 * Warning banner when doc is stale (brand data changed since generation).
 */
function FreshnessBanner({ isStale, isExported, onRegenerate }: FreshnessBannerProps) {
  if (!isStale) {
    return null;
  }

  return (
    <div className="flex items-start gap-3 p-4 bg-[var(--warning-light)] rounded-lg border border-[var(--warning)]/20">
      <AlertTriangle className="h-5 w-5 text-[var(--warning)] shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          Brand data has changed since this document was generated.
        </p>
        <p className="text-sm text-foreground-muted mt-0.5">
          {isExported
            ? 'Your Google Doc is also outdated. Consider regenerating.'
            : 'Consider regenerating for the most accurate content.'}
        </p>
      </div>
      {onRegenerate && (
        <Button size="sm" onClick={onRegenerate} className="shrink-0">
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Regenerate
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// CURRENT STATUS BANNER
// ============================================================================

interface StatusBannerProps {
  isExported: boolean;
  googleDocUrl: string | null;
}

/**
 * Shows current status when doc is fresh (not stale).
 */
function StatusBanner({ isExported, googleDocUrl }: StatusBannerProps) {
  if (!isExported || !googleDocUrl) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-[var(--color-docs-light)] rounded-lg">
      <CheckCircle className="h-4 w-4 text-[var(--color-docs)]" />
      <span className="text-sm text-foreground">
        Saved to Google Docs
      </span>
      <a
        href={googleDocUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary hover:underline inline-flex items-center gap-1 ml-auto"
      >
        Open
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

// ============================================================================
// GOLDEN CIRCLE RENDERER
// ============================================================================

function GoldenCircleViewer({ content }: { content: GoldenCircleContent }) {
  return (
    <div className="space-y-6">
      {/* Why Section */}
      <section>
        <h3 className="text-lg font-semibold mb-2 text-primary">Why</h3>
        <p className="font-medium text-foreground mb-1">{content.why.headline}</p>
        <p className="text-muted-foreground">{content.why.explanation}</p>
      </section>

      {/* How Section */}
      <section>
        <h3 className="text-lg font-semibold mb-2 text-primary">How</h3>
        <p className="font-medium text-foreground mb-1">{content.how.headline}</p>
        <p className="text-muted-foreground">{content.how.explanation}</p>
      </section>

      {/* What Section */}
      <section>
        <h3 className="text-lg font-semibold mb-2 text-primary">What</h3>
        <p className="font-medium text-foreground mb-1">{content.what.headline}</p>
        <p className="text-muted-foreground">{content.what.explanation}</p>
      </section>

      {/* Summary */}
      <section className="pt-4 border-t border-border">
        <p className="text-muted-foreground italic">{content.summary}</p>
      </section>
    </div>
  );
}

// ============================================================================
// GENERIC CONTENT RENDERER
// ============================================================================

function GenericContentViewer({ content }: { content: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      <pre className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-4 rounded-lg overflow-auto">
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
}

// ============================================================================
// METADATA FOOTER
// ============================================================================

interface MetadataFooterProps {
  doc: GeneratedDoc;
  isStale: boolean;
}

function MetadataFooter({ doc, isStale }: MetadataFooterProps) {
  const createdDate = new Date(doc.created_at);
  const formattedDate = createdDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = createdDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center gap-4 text-sm text-foreground-muted pt-4 border-t border-border">
      <span className="flex items-center gap-1.5">
        <Calendar className="h-3.5 w-3.5" />
        Created {formattedDate} at {formattedTime}
      </span>
      {isStale && (
        <Badge variant="warning" className="text-xs">
          Outdated
        </Badge>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Full-screen doc viewer with smart export options.
 * Shows freshness warnings and regenerate button when appropriate.
 *
 * @example
 * <DocViewer
 *   doc={selectedDoc}
 *   brand={brand}
 *   onClose={() => setSelectedDoc(null)}
 *   onRegenerate={handleRegenerate}
 * />
 */
export function DocViewer({ doc, brand, onClose, onRegenerate }: DocViewerProps) {
  const isGoldenCircle = doc.template_id === 'golden-circle';
  const content = doc.content as Record<string, unknown>;

  // Compute state
  const stale = brand ? isDocStale(doc, brand) : false;
  const isExported = !!doc.google_doc_url;

  return (
    <Card className="border-2">
      {/* Header */}
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xl">{doc.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {doc.template_id === 'golden-circle' && 'Simon Sinek\'s Why / How / What framework'}
          </p>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-2">
          {/* Smart export menu */}
          {doc.content_markdown && (
            <DocExportMenu
              markdown={doc.content_markdown}
              title={doc.title}
              docId={doc.id}
              isExported={isExported}
              googleDocUrl={doc.google_doc_url}
            />
          )}

          {/* Regenerate button (if not stale - stale shows in banner) */}
          {onRegenerate && !stale && (
            <Button variant="outline" size="sm" onClick={onRegenerate}>
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Regenerate
            </Button>
          )}

          {/* Close button */}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Freshness warning (if stale) */}
        <FreshnessBanner
          isStale={stale}
          isExported={isExported}
          onRegenerate={onRegenerate}
        />

        {/* Export status (if not stale and exported) */}
        {!stale && (
          <StatusBanner
            isExported={isExported}
            googleDocUrl={doc.google_doc_url}
          />
        )}

        {/* Content */}
        {isGoldenCircle && content ? (
          <GoldenCircleViewer content={content as unknown as GoldenCircleContent} />
        ) : (
          <GenericContentViewer content={content} />
        )}

        {/* Metadata footer */}
        <MetadataFooter doc={doc} isStale={stale} />
      </CardContent>
    </Card>
  );
}
