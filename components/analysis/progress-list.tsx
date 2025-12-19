/**
 * ANALYSIS PROGRESS LIST COMPONENT
 * ==================================
 * Shows the progress of all analyzers for a brand.
 */

'use client';

import { analyzerConfigs } from '@/lib/analyzers';
import { StatusBadge } from '@/components/brands/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AnalysisRun, AnalyzerType } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface ProgressListProps {
  runs: AnalysisRun[];
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Shows analysis progress for all analyzers.
 *
 * @example
 * <ProgressList runs={analysisRuns} />
 */
export function ProgressList({ runs }: ProgressListProps) {
  // Build a map of analyzer type to run
  const runsByType = new Map<AnalyzerType, AnalysisRun>();
  for (const run of runs) {
    runsByType.set(run.analyzer_type, run);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Analysis Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {analyzerConfigs.map((config) => {
          const run = runsByType.get(config.id);
          const status = run?.status || 'queued';
          const Icon = config.icon;

          return (
            <div
              key={config.id}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {config.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {config.description}
                  </p>
                </div>
              </div>
              <StatusBadge status={status} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
