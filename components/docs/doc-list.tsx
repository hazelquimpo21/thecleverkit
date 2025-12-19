/**
 * DOC LIST
 * =========
 * List of generated documents for a brand.
 * Shows when user has created docs and allows viewing/exporting.
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

'use client';

import { FileText } from 'lucide-react';
import { DocListItem } from './doc-list-item';
import type { GeneratedDoc } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface DocListProps {
  /** Array of generated docs */
  docs: GeneratedDoc[];

  /** Callback when a doc is selected for viewing */
  onViewDoc: (doc: GeneratedDoc) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * List of generated docs with view/export actions.
 *
 * @example
 * <DocList docs={docs} onViewDoc={setSelectedDoc} />
 */
export function DocList({ docs, onViewDoc }: DocListProps) {
  // Filter to only show completed docs
  const completedDocs = docs.filter(doc => doc.status === 'complete');

  if (completedDocs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Your Docs</h2>
        <span className="text-sm text-muted-foreground">({completedDocs.length})</span>
      </div>

      <div className="space-y-2">
        {completedDocs.map(doc => (
          <DocListItem
            key={doc.id}
            doc={doc}
            onView={() => onViewDoc(doc)}
          />
        ))}
      </div>
    </div>
  );
}
