/**
 * DOC TEMPLATE CARD
 * ==================
 * Card displaying a single doc template with readiness status.
 * Shows template info and generate/info button based on readiness.
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReadinessBadge } from './readiness-badge';
import { MissingDataDialog } from './missing-data-dialog';
import type { DocTemplateConfig } from '@/lib/docs/types';
import type { ReadinessCheckResult } from '@/lib/docs/types';

// ============================================================================
// TYPES
// ============================================================================

interface DocTemplateCardProps {
  /** Template configuration */
  config: DocTemplateConfig;

  /** Readiness check result */
  readiness: ReadinessCheckResult;

  /** Whether generation is in progress */
  isGenerating?: boolean;

  /** Callback when generate button is clicked */
  onGenerate: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Card for a single doc template.
 * Shows readiness status and generate/info button.
 *
 * @example
 * <DocTemplateCard
 *   config={goldenCircleConfig}
 *   readiness={readinessResult}
 *   onGenerate={() => generateDoc('golden-circle')}
 * />
 */
export function DocTemplateCard({
  config,
  readiness,
  isGenerating = false,
  onGenerate,
}: DocTemplateCardProps) {
  const [showMissingDialog, setShowMissingDialog] = useState(false);
  const Icon = config.icon;

  return (
    <>
      <Card className="hover:border-primary/30 transition-colors">
        <CardContent className="p-5">
          {/* Icon and title row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{config.name}</h3>
                <ReadinessBadge
                  isReady={readiness.isReady}
                  onClick={!readiness.isReady ? () => setShowMissingDialog(true) : undefined}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4">
            {config.description}
          </p>

          {/* Action button */}
          {readiness.isReady ? (
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
              ) : (
                'Generate'
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => setShowMissingDialog(true)}
            >
              See what&apos;s needed
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Missing data dialog */}
      <MissingDataDialog
        open={showMissingDialog}
        onOpenChange={setShowMissingDialog}
        templateName={config.name}
        missingAnalyzers={readiness.missingAnalyzers}
        missingFields={readiness.missingFields}
      />
    </>
  );
}
