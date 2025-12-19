/**
 * DOC TEMPLATE GRID
 * ==================
 * Grid of available doc templates with readiness status.
 * Users can see which templates are ready and generate them.
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

'use client';

import { DocTemplateCard } from './doc-template-card';
import { useTemplatesWithReadiness, useGenerateDoc } from '@/hooks';
import type { AnalysisRun, DocTemplateId } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface DocTemplateGridProps {
  /** Brand ID for generation */
  brandId: string;

  /** Analysis runs for readiness checking */
  runs: AnalysisRun[];
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Grid displaying all available doc templates.
 * Shows readiness status and allows generation.
 *
 * @example
 * <DocTemplateGrid brandId={brand.id} runs={analysisRuns} />
 */
export function DocTemplateGrid({ brandId, runs }: DocTemplateGridProps) {
  const templates = useTemplatesWithReadiness(runs);
  const generateDoc = useGenerateDoc();

  const handleGenerate = (templateId: DocTemplateId) => {
    generateDoc.mutate({ brandId, templateId });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Generate a Doc</h2>
        <p className="text-sm text-muted-foreground">
          Create strategic documents from your brand analysis
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(({ config, readiness }) => (
          <DocTemplateCard
            key={config.id}
            config={config}
            readiness={readiness}
            isGenerating={
              generateDoc.isPending &&
              generateDoc.variables?.templateId === config.id
            }
            onGenerate={() => handleGenerate(config.id)}
          />
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No templates available yet.</p>
        </div>
      )}
    </div>
  );
}
