/**
 * DOCS TAB CONTENT
 * =================
 * Main content for the docs tab on brand profile pages.
 * Combines template grid, doc list, and doc viewer.
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

'use client';

import { useState } from 'react';
import { DocTemplateGrid } from './doc-template-grid';
import { DocList } from './doc-list';
import { DocViewer } from './doc-viewer';
import { useBrandDocs } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import type { AnalysisRun, GeneratedDoc } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface DocsTabContentProps {
  /** Brand ID for fetching/creating docs */
  brandId: string;

  /** Analysis runs for readiness checking */
  runs: AnalysisRun[];
}

// ============================================================================
// LOADING STATE
// ============================================================================

function DocsLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Template grid skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>

      {/* Doc list skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Complete docs tab content for brand profile.
 * Shows available templates, generated docs, and doc viewer.
 *
 * @example
 * <DocsTabContent brandId={brand.id} runs={analysisRuns} />
 */
export function DocsTabContent({ brandId, runs }: DocsTabContentProps) {
  const [selectedDoc, setSelectedDoc] = useState<GeneratedDoc | null>(null);
  const { data: docs, isLoading } = useBrandDocs(brandId);

  if (isLoading) {
    return <DocsLoadingSkeleton />;
  }

  // Show doc viewer if a doc is selected
  if (selectedDoc) {
    return (
      <DocViewer
        doc={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Template grid - generate new docs */}
      <DocTemplateGrid brandId={brandId} runs={runs} />

      {/* Divider if there are docs */}
      {docs && docs.length > 0 && (
        <hr className="border-border" />
      )}

      {/* Generated docs list */}
      {docs && docs.length > 0 && (
        <DocList
          docs={docs}
          onViewDoc={setSelectedDoc}
        />
      )}
    </div>
  );
}
