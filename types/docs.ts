/**
 * GENERATED DOCS TYPES
 * =====================
 * Types for generated documents stored in the database.
 * Each doc is a snapshot created from brand analysis data.
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

// ============================================================================
// DOC STATUS
// ============================================================================

/**
 * Status of a generated document.
 * - generating: Doc is being created by AI
 * - complete: Doc is ready to view/export
 * - error: Generation failed
 */
export type DocStatus = 'generating' | 'complete' | 'error';

// ============================================================================
// TEMPLATE IDENTIFIERS
// ============================================================================

/**
 * Available doc template identifiers.
 * Add new templates here as they're created.
 *
 * @update When adding a new template, add its ID here
 */
export type DocTemplateId = 'golden-circle';

// ============================================================================
// GENERATED DOC (DATABASE ROW)
// ============================================================================

/**
 * A generated document stored in the database.
 * Matches the generated_docs table schema.
 */
export type GeneratedDoc = {
  /** UUID primary key */
  id: string;

  /** Reference to the brand this doc belongs to */
  brand_id: string;

  /** Which template was used (e.g., 'golden-circle') */
  template_id: DocTemplateId;

  /** Display title (e.g., "Golden Circle: Acme Corp") */
  title: string;

  /** Structured content from AI parsing */
  content: Record<string, unknown>;

  /** Rendered markdown for export (null while generating) */
  content_markdown: string | null;

  /** Snapshot of brand/analyzer data at generation time */
  source_data: Record<string, unknown>;

  /** Current status of the doc */
  status: DocStatus;

  /** Error message if status is 'error' */
  error_message: string | null;

  /** When the doc was created */
  created_at: string;

  /** When the doc was last updated */
  updated_at: string;

  // ============================================================================
  // GOOGLE DOCS EXPORT
  // ============================================================================

  /** Google Docs document ID (if exported) */
  google_doc_id: string | null;

  /** Direct URL to the Google Doc */
  google_doc_url: string | null;

  /** When the doc was last exported to Google Docs */
  google_exported_at: string | null;
};

// ============================================================================
// INSERT/UPDATE TYPES
// ============================================================================

/**
 * Type for inserting a new generated doc.
 */
export type GeneratedDocInsert = {
  brand_id: string;
  template_id: DocTemplateId;
  title: string;
  content?: Record<string, unknown>;
  content_markdown?: string | null;
  source_data: Record<string, unknown>;
  status?: DocStatus;
  error_message?: string | null;
  // Google Docs export (optional on insert)
  google_doc_id?: string | null;
  google_doc_url?: string | null;
  google_exported_at?: string | null;
};

/**
 * Type for updating an existing generated doc.
 */
export type GeneratedDocUpdate = Partial<
  Omit<GeneratedDoc, 'id' | 'brand_id' | 'template_id' | 'created_at'>
>;

// ============================================================================
// JOINED TYPES
// ============================================================================

/**
 * Brand with all its generated docs included.
 * Used when fetching brand profile with docs tab.
 */
export type BrandWithDocs = {
  id: string;
  name: string | null;
  source_url: string;
  generated_docs: GeneratedDoc[];
};
