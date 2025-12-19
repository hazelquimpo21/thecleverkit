/**
 * DOC LIST
 * =========
 * List of generated documents for a brand.
 * Shows completed docs with view/export actions.
 *
 * @created 2025-12-19 - Initial docs feature implementation
 * @updated 2025-12-19 - Added brand prop for freshness checking
 */

'use client';

import { DocListItem } from './doc-list-item';
import type { Brand, GeneratedDoc } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface DocListProps {
  /** Array of generated docs */
  docs: GeneratedDoc[];

  /** Brand for freshness checking */
  brand?: Brand;

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
 * <DocList docs={docs} brand={brand} onViewDoc={setSelectedDoc} />
 */
export function DocList({ docs, brand, onViewDoc }: DocListProps) {
  // Filter to only show completed docs
  const completedDocs = docs.filter(doc => doc.status === 'complete');

  if (completedDocs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {completedDocs.map(doc => (
        <DocListItem
          key={doc.id}
          doc={doc}
          brand={brand}
          onView={() => onViewDoc(doc)}
        />
      ))}
    </div>
  );
}
