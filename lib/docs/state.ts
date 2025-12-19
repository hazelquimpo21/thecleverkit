/**
 * DOC STATE UTILITIES
 * ====================
 * Utilities for determining the state of generated documents.
 * Used to render intelligent buttons and status indicators.
 *
 * States:
 * - never_generated: Template has never been used for this brand
 * - generated_fresh: Doc exists and brand data hasn't changed
 * - generated_stale: Doc exists but brand data has changed since generation
 * - exported_current: Doc exported to Google Docs, doc hasn't changed since export
 * - exported_stale: Doc exported but doc was regenerated since export
 *
 * @created 2025-12-19 - Intelligent buttons feature
 */

import type { GeneratedDoc, Brand } from '@/types';
import { log } from '@/lib/utils/logger';

// ============================================================================
// DOC STATE TYPES
// ============================================================================

/**
 * Possible states of a document relative to its source data and exports.
 *
 * Flow:
 *   never_generated → generated_fresh → (if brand updates) → generated_stale
 *                                    ↘ (if exported) → exported_current
 *                                                    ↘ (if doc regenerates) → exported_stale
 */
export type DocGenerationState =
  | 'never_generated'   // No doc exists for this template
  | 'generated_fresh'   // Doc exists, brand data hasn't changed
  | 'generated_stale';  // Doc exists, but brand data changed since generation

export type DocExportState =
  | 'not_exported'      // Never exported to Google Docs
  | 'exported_current'  // Exported and doc hasn't changed since
  | 'exported_stale';   // Exported but doc was regenerated since export

/**
 * Complete state of a document including generation and export status.
 */
export interface DocState {
  /** Whether a doc exists for this template */
  exists: boolean;

  /** The most recent doc for this template (if any) */
  latestDoc: GeneratedDoc | null;

  /** Count of docs generated with this template */
  generationCount: number;

  /** Generation state relative to brand data */
  generationState: DocGenerationState;

  /** Export state relative to Google Docs */
  exportState: DocExportState;

  /** Whether the doc's content is stale (brand data changed) */
  isStale: boolean;

  /** Whether the doc has been exported to Google Docs */
  isExported: boolean;

  /** Whether the Google Docs copy is outdated */
  isExportStale: boolean;

  /** Human-readable status message */
  statusMessage: string;

  /** Suggested primary action based on state */
  primaryAction: DocPrimaryAction;
}

/**
 * Primary action to show based on doc state.
 */
export type DocPrimaryAction =
  | 'generate'           // No doc exists → "Generate"
  | 'view'               // Doc exists → "View"
  | 'view_and_regenerate' // Doc exists but stale → "View" + highlighted "Regenerate"
  | 'open_in_docs';      // Exported to Docs → "Open in Docs"

// ============================================================================
// STATE COMPUTATION
// ============================================================================

interface GetDocStateInput {
  /** All docs for this template and brand */
  docs: GeneratedDoc[];

  /** The brand to check against */
  brand: Brand;

  /** Optional: specific template ID to filter */
  templateId?: string;
}

/**
 * Computes the complete state of a document.
 *
 * @param input - Docs, brand, and optional template filter
 * @returns Complete doc state object
 *
 * @example
 * const state = getDocState({
 *   docs: brandDocs.filter(d => d.template_id === 'golden-circle'),
 *   brand,
 * });
 * if (state.isStale) {
 *   // Show regenerate prompt
 * }
 */
export function getDocState(input: GetDocStateInput): DocState {
  const { docs, brand, templateId } = input;

  // Filter to relevant docs
  const relevantDocs = templateId
    ? docs.filter(d => d.template_id === templateId && d.status === 'complete')
    : docs.filter(d => d.status === 'complete');

  // Sort by created_at descending to get latest first
  const sortedDocs = [...relevantDocs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const latestDoc = sortedDocs[0] ?? null;
  const generationCount = sortedDocs.length;
  const exists = latestDoc !== null;

  // Compute generation state (is doc stale relative to brand?)
  const generationState = computeGenerationState(latestDoc, brand);
  const isStale = generationState === 'generated_stale';

  // Compute export state
  const exportState = computeExportState(latestDoc);
  const isExported = !!latestDoc?.google_doc_url;
  const isExportStale = exportState === 'exported_stale';

  // Determine primary action
  const primaryAction = determinePrimaryAction(generationState, exportState, isStale);

  // Build status message
  const statusMessage = buildStatusMessage(latestDoc, generationState, exportState);

  log.debug('Doc state computed', {
    templateId,
    exists,
    generationCount,
    generationState,
    exportState,
    isStale,
    isExported,
    isExportStale,
    primaryAction,
  });

  return {
    exists,
    latestDoc,
    generationCount,
    generationState,
    exportState,
    isStale,
    isExported,
    isExportStale,
    statusMessage,
    primaryAction,
  };
}

/**
 * Computes generation state by comparing doc and brand timestamps.
 */
function computeGenerationState(doc: GeneratedDoc | null, brand: Brand): DocGenerationState {
  if (!doc) {
    return 'never_generated';
  }

  const docCreatedAt = new Date(doc.created_at).getTime();
  const brandUpdatedAt = new Date(brand.updated_at).getTime();

  // If brand was updated after doc was created, doc is stale
  if (brandUpdatedAt > docCreatedAt) {
    return 'generated_stale';
  }

  return 'generated_fresh';
}

/**
 * Computes export state by comparing doc creation and export timestamps.
 */
function computeExportState(doc: GeneratedDoc | null): DocExportState {
  if (!doc || !doc.google_doc_url) {
    return 'not_exported';
  }

  // If doc doesn't have export timestamp, assume it's current
  if (!doc.google_exported_at) {
    return 'exported_current';
  }

  const docCreatedAt = new Date(doc.created_at).getTime();
  const exportedAt = new Date(doc.google_exported_at).getTime();

  // If doc was created after last export, the export is stale
  // (This shouldn't happen for the same doc, but handles edge cases)
  if (docCreatedAt > exportedAt) {
    return 'exported_stale';
  }

  return 'exported_current';
}

/**
 * Determines the primary action based on current state.
 */
function determinePrimaryAction(
  generationState: DocGenerationState,
  exportState: DocExportState,
  isStale: boolean
): DocPrimaryAction {
  // No doc → Generate
  if (generationState === 'never_generated') {
    return 'generate';
  }

  // Doc exists and exported → Open in Docs (unless stale)
  if (exportState !== 'not_exported' && !isStale) {
    return 'open_in_docs';
  }

  // Doc is stale → View with regenerate prompt
  if (isStale) {
    return 'view_and_regenerate';
  }

  // Default: View the doc
  return 'view';
}

/**
 * Builds a human-readable status message.
 */
function buildStatusMessage(
  doc: GeneratedDoc | null,
  generationState: DocGenerationState,
  exportState: DocExportState
): string {
  if (!doc) {
    return 'Not yet generated';
  }

  const date = new Date(doc.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const parts: string[] = [`Generated ${date}`];

  // Add stale warning
  if (generationState === 'generated_stale') {
    parts.push('• Data updated');
  }

  // Add export status
  if (exportState === 'exported_current') {
    parts.push('• In Google Docs');
  } else if (exportState === 'exported_stale') {
    parts.push('• Docs outdated');
  }

  return parts.join(' ');
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gets the latest doc for a specific template from a list of docs.
 *
 * @param docs - All docs for a brand
 * @param templateId - The template to find
 * @returns The most recent doc for that template, or null
 */
export function getLatestDocForTemplate(
  docs: GeneratedDoc[],
  templateId: string
): GeneratedDoc | null {
  const templateDocs = docs
    .filter(d => d.template_id === templateId && d.status === 'complete')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return templateDocs[0] ?? null;
}

/**
 * Counts completed docs for a specific template.
 *
 * @param docs - All docs for a brand
 * @param templateId - The template to count
 * @returns Number of completed docs
 */
export function countDocsForTemplate(docs: GeneratedDoc[], templateId: string): number {
  return docs.filter(d => d.template_id === templateId && d.status === 'complete').length;
}

/**
 * Checks if a doc is stale (brand data changed since generation).
 *
 * @param doc - The doc to check
 * @param brand - The brand to compare against
 * @returns true if doc is stale
 */
export function isDocStale(doc: GeneratedDoc, brand: Brand): boolean {
  const docCreatedAt = new Date(doc.created_at).getTime();
  const brandUpdatedAt = new Date(brand.updated_at).getTime();
  return brandUpdatedAt > docCreatedAt;
}

/**
 * Checks if a doc's Google Docs export is stale.
 *
 * @param doc - The doc to check
 * @returns true if export is stale, false if not exported or current
 */
export function isExportStale(doc: GeneratedDoc): boolean {
  if (!doc.google_doc_url || !doc.google_exported_at) {
    return false;
  }

  const docCreatedAt = new Date(doc.created_at).getTime();
  const exportedAt = new Date(doc.google_exported_at).getTime();

  return docCreatedAt > exportedAt;
}

// ============================================================================
// BATCH UTILITIES
// ============================================================================

/**
 * Computes state for all docs of a brand, grouped by template.
 *
 * @param docs - All docs for a brand
 * @param brand - The brand
 * @returns Map of template ID to doc state
 */
export function getAllDocStates(
  docs: GeneratedDoc[],
  brand: Brand
): Record<string, DocState> {
  // Group docs by template
  const byTemplate: Record<string, GeneratedDoc[]> = {};

  for (const doc of docs) {
    if (!byTemplate[doc.template_id]) {
      byTemplate[doc.template_id] = [];
    }
    byTemplate[doc.template_id].push(doc);
  }

  // Compute state for each template
  const result: Record<string, DocState> = {};

  for (const [templateId, templateDocs] of Object.entries(byTemplate)) {
    result[templateId] = getDocState({
      docs: templateDocs,
      brand,
      templateId,
    });
  }

  return result;
}
