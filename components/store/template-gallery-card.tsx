/**
 * TEMPLATE GALLERY CARD
 * ======================
 * Enhanced template card for the store gallery view.
 * Shows illustration, readiness status, doc state, and intelligent action buttons.
 *
 * Features:
 * - CSS-based illustration
 * - Readiness badge (Ready / Needs data / Coming soon)
 * - Smart doc state awareness (fresh/stale, exported/not)
 * - Intelligent buttons that adapt to current state:
 *   - Never generated → "Generate"
 *   - Generated + fresh → "View" + "Export"
 *   - Generated + exported → "View" + "Open in Docs"
 *   - Generated + stale → "View" + "Regenerate" (highlighted)
 *
 * @created 2025-12-19 - Template Store feature
 * @updated 2025-12-19 - Added intelligent buttons based on doc state
 */

'use client';

import { useState } from 'react';
import {
  Loader2,
  Clock,
  Sparkles,
  Eye,
  RefreshCw,
  ExternalLink,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TemplateIllustration } from './template-illustration';
import { MissingDataDialog } from '@/components/docs/missing-data-dialog';
import { getDocState, type DocState } from '@/lib/docs/state';
import { log } from '@/lib/utils/logger';
import type { DocTemplateConfig, ReadinessCheckResult } from '@/lib/docs/types';
import type { GeneratedDoc, Brand } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface TemplateGalleryCardProps {
  /** Template configuration */
  config: DocTemplateConfig;

  /** Readiness check result for this template */
  readiness?: ReadinessCheckResult;

  /** All docs for this brand (filtered by template internally) */
  docs?: GeneratedDoc[];

  /** The brand for freshness checking */
  brand?: Brand;

  /** Whether generation is currently in progress */
  isGenerating?: boolean;

  /** Callback when generate button is clicked */
  onGenerate?: () => void;

  /** Callback when view button is clicked (opens doc viewer) */
  onViewDoc?: (doc: GeneratedDoc) => void;

  /** Callback when regenerate button is clicked */
  onRegenerate?: () => void;
}

// ============================================================================
// STATUS BADGE
// ============================================================================

interface StatusBadgeProps {
  config: DocTemplateConfig;
  readiness?: ReadinessCheckResult;
  onNeedsDataClick?: () => void;
}

function TemplateStatusBadge({ config, readiness, onNeedsDataClick }: StatusBadgeProps) {
  // Coming soon template
  if (config.status === 'coming_soon') {
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3" />
        Coming Soon
      </Badge>
    );
  }

  // Ready to generate
  if (readiness?.isReady) {
    return (
      <Badge variant="success" className="gap-1">
        <Sparkles className="h-3 w-3" />
        Ready
      </Badge>
    );
  }

  // Needs data - clickable
  return (
    <Badge
      variant="warning"
      className="gap-1 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={onNeedsDataClick}
    >
      Needs Data
    </Badge>
  );
}

// ============================================================================
// DOC STATE INDICATOR
// ============================================================================

interface DocStateIndicatorProps {
  state: DocState;
}

/**
 * Shows the current doc state: generation date, export status, stale warnings.
 */
function DocStateIndicator({ state }: DocStateIndicatorProps) {
  if (!state.exists) {
    return null;
  }

  const { latestDoc, isStale, isExported, isExportStale, generationCount } = state;

  // Format the generation date
  const dateStr = latestDoc
    ? new Date(latestDoc.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs text-foreground-muted">
      {/* Generation info */}
      <span className="flex items-center gap-1">
        <FileText className="h-3 w-3" />
        {dateStr}
        {generationCount > 1 && (
          <span className="text-foreground-subtle">({generationCount}×)</span>
        )}
      </span>

      {/* Stale warning */}
      {isStale && (
        <Badge variant="warning" className="text-[10px] px-1.5 py-0">
          <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
          Updated
        </Badge>
      )}

      {/* Export status */}
      {isExported && !isExportStale && (
        <Badge variant="docs" className="text-[10px] px-1.5 py-0">
          In Docs
        </Badge>
      )}
      {isExportStale && (
        <Badge variant="warning" className="text-[10px] px-1.5 py-0">
          Docs outdated
        </Badge>
      )}
    </div>
  );
}

// ============================================================================
// INTELLIGENT ACTION BUTTONS
// ============================================================================

interface ActionButtonsProps {
  config: DocTemplateConfig;
  readiness?: ReadinessCheckResult;
  state: DocState;
  isGenerating: boolean;
  onGenerate: () => void;
  onViewDoc: () => void;
  onRegenerate: () => void;
  onNeedsDataClick: () => void;
}

/**
 * Renders intelligent action buttons based on doc state.
 * Adapts to show the most relevant actions for the current context.
 */
function ActionButtons({
  config,
  readiness,
  state,
  isGenerating,
  onGenerate,
  onViewDoc,
  onRegenerate,
  onNeedsDataClick,
}: ActionButtonsProps) {
  const isComingSoon = config.status === 'coming_soon';
  const isReady = readiness?.isReady ?? false;

  // Coming soon → Disabled button
  if (isComingSoon) {
    return (
      <Button variant="outline" size="sm" className="w-full" disabled>
        Coming Soon
      </Button>
    );
  }

  // Not ready → "See what's needed"
  if (!isReady) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={onNeedsDataClick}
      >
        See what&apos;s needed
      </Button>
    );
  }

  // Currently generating → Loading state
  if (isGenerating) {
    return (
      <Button size="sm" className="w-full" disabled>
        <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
        Generating...
      </Button>
    );
  }

  // NEVER GENERATED → Single "Generate" button
  if (!state.exists) {
    return (
      <Button size="sm" className="w-full" onClick={onGenerate}>
        Generate
      </Button>
    );
  }

  // DOC EXISTS → Smart button row
  const { isStale, isExported, latestDoc } = state;

  // If stale, promote regenerate
  if (isStale) {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onViewDoc}
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          View
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={onRegenerate}
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          Regenerate
        </Button>
      </div>
    );
  }

  // If exported → Show "Open in Docs" as secondary
  if (isExported && latestDoc?.google_doc_url) {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onViewDoc}
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          View
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => window.open(latestDoc.google_doc_url!, '_blank')}
        >
          <ExternalLink className="w-3.5 h-3.5 mr-1" />
          Open in Docs
        </Button>
      </div>
    );
  }

  // Default: View + Generate New (de-emphasized)
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        className="flex-1"
        onClick={onViewDoc}
      >
        <Eye className="w-3.5 h-3.5 mr-1" />
        View
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={onRegenerate}
      >
        <RefreshCw className="w-3.5 h-3.5 mr-1" />
        New
      </Button>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Gallery card for a template in the store.
 * Shows illustration, status, doc state, and intelligent action buttons.
 *
 * @example
 * <TemplateGalleryCard
 *   config={goldenCircleConfig}
 *   readiness={readinessResult}
 *   docs={brandDocs}
 *   brand={brand}
 *   onGenerate={() => generateDoc('golden-circle')}
 *   onViewDoc={(doc) => setSelectedDoc(doc)}
 * />
 */
export function TemplateGalleryCard({
  config,
  readiness,
  docs = [],
  brand,
  isGenerating = false,
  onGenerate,
  onViewDoc,
  onRegenerate,
}: TemplateGalleryCardProps) {
  const [showMissingDialog, setShowMissingDialog] = useState(false);

  const isComingSoon = config.status === 'coming_soon';

  // Compute doc state (handles null brand gracefully)
  const docState: DocState = brand
    ? getDocState({
        docs: docs.filter(d => d.template_id === config.id),
        brand,
        templateId: config.id,
      })
    : {
        exists: false,
        latestDoc: null,
        generationCount: 0,
        generationState: 'never_generated',
        exportState: 'not_exported',
        isStale: false,
        isExported: false,
        isExportStale: false,
        statusMessage: 'Not yet generated',
        primaryAction: 'generate',
      };

  // Handler wrappers with logging
  const handleGenerate = () => {
    log.info('TemplateCard: Generate clicked', { templateId: config.id });
    onGenerate?.();
  };

  const handleViewDoc = () => {
    if (docState.latestDoc) {
      log.info('TemplateCard: View clicked', { templateId: config.id, docId: docState.latestDoc.id });
      onViewDoc?.(docState.latestDoc);
    }
  };

  const handleRegenerate = () => {
    log.info('TemplateCard: Regenerate clicked', { templateId: config.id });
    // Regenerate uses the same generate flow
    onRegenerate?.() ?? onGenerate?.();
  };

  return (
    <>
      <Card
        interactive={!isComingSoon}
        className={isComingSoon ? 'opacity-70' : undefined}
      >
        {/* Illustration area */}
        <TemplateIllustration
          templateId={config.id}
          available={!isComingSoon}
        />

        <CardContent className="p-4 space-y-3">
          {/* Title and description */}
          <div>
            <h3 className="font-semibold text-foreground">
              {config.name}
            </h3>
            <p className="text-sm text-foreground-muted line-clamp-2 mt-0.5">
              {config.shortDescription || config.description}
            </p>
          </div>

          {/* Status row: readiness badge + doc state */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <TemplateStatusBadge
                config={config}
                readiness={readiness}
                onNeedsDataClick={() => setShowMissingDialog(true)}
              />
            </div>
            {/* Doc state indicator (only when doc exists) */}
            {docState.exists && (
              <DocStateIndicator state={docState} />
            )}
          </div>

          {/* Action buttons */}
          <ActionButtons
            config={config}
            readiness={readiness}
            state={docState}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
            onViewDoc={handleViewDoc}
            onRegenerate={handleRegenerate}
            onNeedsDataClick={() => setShowMissingDialog(true)}
          />
        </CardContent>
      </Card>

      {/* Missing data dialog */}
      {readiness && (
        <MissingDataDialog
          open={showMissingDialog}
          onOpenChange={setShowMissingDialog}
          templateName={config.name}
          missingAnalyzers={readiness.missingAnalyzers}
          missingFields={readiness.missingFields}
        />
      )}
    </>
  );
}
