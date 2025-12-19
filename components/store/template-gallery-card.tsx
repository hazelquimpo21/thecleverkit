/**
 * TEMPLATE GALLERY CARD
 * ======================
 * Enhanced template card for the store gallery view.
 * Shows illustration, readiness status, generation history, and action button.
 *
 * Features:
 * - CSS-based illustration
 * - Readiness badge (Ready / Needs data / Coming soon)
 * - Generation count for previously used templates
 * - One-click generate or "See what's needed" action
 *
 * @created 2025-12-19 - Template Store feature
 */

'use client';

import { useState } from 'react';
import { Loader2, Clock, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TemplateIllustration } from './template-illustration';
import { MissingDataDialog } from '@/components/docs/missing-data-dialog';
import type { DocTemplateConfig, ReadinessCheckResult } from '@/lib/docs/types';

// ============================================================================
// TYPES
// ============================================================================

interface TemplateGalleryCardProps {
  /** Template configuration */
  config: DocTemplateConfig;

  /** Readiness check result for this template */
  readiness?: ReadinessCheckResult;

  /** Number of times this template has been generated for this brand */
  generationCount?: number;

  /** Whether generation is currently in progress */
  isGenerating?: boolean;

  /** Callback when generate button is clicked */
  onGenerate?: () => void;
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
// GENERATION INDICATOR
// ============================================================================

interface GenerationIndicatorProps {
  count: number;
}

function GenerationIndicator({ count }: GenerationIndicatorProps) {
  if (count === 0) return null;

  return (
    <span className="text-xs text-foreground-muted">
      Generated {count}×
    </span>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Gallery card for a template in the store.
 * Shows illustration, status, and action button.
 *
 * @example
 * <TemplateGalleryCard
 *   config={goldenCircleConfig}
 *   readiness={readinessResult}
 *   generationCount={2}
 *   onGenerate={() => generateDoc('golden-circle')}
 * />
 */
export function TemplateGalleryCard({
  config,
  readiness,
  generationCount = 0,
  isGenerating = false,
  onGenerate,
}: TemplateGalleryCardProps) {
  const [showMissingDialog, setShowMissingDialog] = useState(false);

  const isComingSoon = config.status === 'coming_soon';
  const isReady = readiness?.isReady ?? false;
  const canGenerate = !isComingSoon && isReady && !isGenerating;

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

          {/* Status row */}
          <div className="flex items-center justify-between">
            <TemplateStatusBadge
              config={config}
              readiness={readiness}
              onNeedsDataClick={() => setShowMissingDialog(true)}
            />
            <GenerationIndicator count={generationCount} />
          </div>

          {/* Action button */}
          {isComingSoon ? (
            <Button variant="outline" size="sm" className="w-full" disabled>
              Coming Soon
            </Button>
          ) : isReady ? (
            <Button
              size="sm"
              className="w-full"
              onClick={onGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : generationCount > 0 ? (
                'Generate New'
              ) : (
                'Generate'
              )}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowMissingDialog(true)}
            >
              See what&apos;s needed
            </Button>
          )}
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
