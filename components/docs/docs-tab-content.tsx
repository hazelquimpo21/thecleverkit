/**
 * DOCS TAB CONTENT
 * =================
 * Archive view of all generated documents for a brand.
 * Simple list-based view for managing existing docs.
 *
 * Note: For generating new docs, use the Store tab instead.
 * This tab is a clean archive view for power users.
 *
 * @created 2025-12-19 - Initial docs feature implementation
 * @updated 2025-12-19 - Simplified to archive-only view (generation moved to Store)
 */

'use client';

import { useState } from 'react';
import { FileText, FolderOpen } from 'lucide-react';
import { DocList } from './doc-list';
import { DocViewer } from './doc-viewer';
import { useBrandDocs } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import type { Brand, GeneratedDoc } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface DocsTabContentProps {
  /** Brand ID for fetching docs */
  brandId: string;

  /** The brand object (for freshness checking in viewer) */
  brand?: Brand;
}

// ============================================================================
// LOADING STATE
// ============================================================================

function DocsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-16 rounded-lg" />
    </div>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

function DocsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center mb-4">
        <FolderOpen className="w-6 h-6 text-foreground-muted" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">
        No documents yet
      </h3>
      <p className="text-sm text-foreground-muted max-w-sm">
        Generate your first document from the Store tab to see it here.
      </p>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Archive view for all generated documents.
 * Shows a clean list of docs with view/export/delete actions.
 *
 * @example
 * <DocsTabContent brandId={brand.id} brand={brand} />
 */
export function DocsTabContent({ brandId, brand }: DocsTabContentProps) {
  const [selectedDoc, setSelectedDoc] = useState<GeneratedDoc | null>(null);
  const { data: docs, isLoading } = useBrandDocs(brandId);

  if (isLoading) {
    return <DocsLoadingSkeleton />;
  }

  // Filter to only completed docs
  const completedDocs = docs?.filter(d => d.status === 'complete') ?? [];

  // Show doc viewer if a doc is selected
  if (selectedDoc) {
    return (
      <DocViewer
        doc={selectedDoc}
        brand={brand}
        onClose={() => setSelectedDoc(null)}
      />
    );
  }

  // Empty state when no docs
  if (completedDocs.length === 0) {
    return <DocsEmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-[var(--color-docs)]" />
        <h2 className="text-xl font-semibold text-foreground">
          Your Documents
        </h2>
        <span className="text-sm text-foreground-muted">
          ({completedDocs.length})
        </span>
      </div>

      {/* Doc list */}
      <DocList
        docs={completedDocs}
        brand={brand}
        onViewDoc={setSelectedDoc}
      />
    </div>
  );
}
