/**
 * DOC TEMPLATE TYPES
 * ===================
 * Types for doc template definitions.
 * Each template implements these interfaces to enable generation.
 *
 * Templates follow the same two-step AI pattern as analyzers:
 * 1. Analysis: Generate natural language doc content
 * 2. Parsing: Extract structured sections via function calling
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

import type { LucideIcon } from 'lucide-react';
import type { AnalyzerType, ParsedBasics, ParsedCustomer, ParsedProducts } from '@/types';
import type { DocTemplateId } from '@/types/docs';

// ============================================================================
// BRAND DATA (INPUT TO TEMPLATES)
// ============================================================================

/**
 * Aggregated brand data passed to doc templates.
 * Contains all analyzer outputs needed for generation.
 */
export interface BrandData {
  /** The brand's display name */
  brandName: string;

  /** The brand's website URL */
  sourceUrl: string;

  /** Parsed data from basics analyzer (may be null if not complete) */
  basics: ParsedBasics | null;

  /** Parsed data from customer analyzer (may be null if not complete) */
  customer: ParsedCustomer | null;

  /** Parsed data from products analyzer (may be null if not complete) */
  products: ParsedProducts | null;
}

// ============================================================================
// TEMPLATE CATEGORIES
// ============================================================================

/**
 * Template category for organizing the store.
 */
export type TemplateCategory = 'strategy' | 'audience' | 'content' | 'sales';

/**
 * Category metadata for display in the store.
 */
export interface TemplateCategoryConfig {
  id: TemplateCategory;
  label: string;
  description: string;
  order: number;
}

/**
 * All template categories with display info.
 * Ordered by the `order` field for consistent rendering.
 */
export const TEMPLATE_CATEGORIES: Record<TemplateCategory, TemplateCategoryConfig> = {
  strategy: {
    id: 'strategy',
    label: 'Strategy',
    description: 'Brand strategy and positioning',
    order: 1,
  },
  audience: {
    id: 'audience',
    label: 'Audience',
    description: 'Customer and audience insights',
    order: 2,
  },
  content: {
    id: 'content',
    label: 'Content',
    description: 'Content strategy and messaging',
    order: 3,
  },
  sales: {
    id: 'sales',
    label: 'Sales',
    description: 'Sales enablement materials',
    order: 4,
  },
};

// ============================================================================
// TEMPLATE CONFIG
// ============================================================================

/**
 * Field requirements for a specific analyzer.
 * Maps to keys of the analyzer's parsed data type.
 */
export type RequiredFields = {
  basics?: (keyof ParsedBasics)[];
  customer?: (keyof ParsedCustomer)[];
  products?: (keyof ParsedProducts)[];
};

/**
 * Configuration metadata for a doc template.
 * Defines what the template is and what data it needs.
 *
 * @update 2025-12-19 - Added category and status for Template Store
 */
export interface DocTemplateConfig {
  /** Unique identifier (must match DocTemplateId type) */
  id: DocTemplateId;

  /** Display name for UI (e.g., "Golden Circle") */
  name: string;

  /** Short description explaining what the doc provides */
  description: string;

  /** Short description for store cards (2 lines max) */
  shortDescription?: string;

  /** Icon component from lucide-react */
  icon: LucideIcon;

  /** Category for organizing in the store */
  category: TemplateCategory;

  /** Whether the template is available or coming soon */
  status: 'available' | 'coming_soon';

  /** Which analyzers must be complete to generate this doc */
  requiredAnalyzers: AnalyzerType[];

  /**
   * Specific fields required from each analyzer.
   * If not specified, just having the analyzer complete is sufficient.
   */
  requiredFields?: RequiredFields;
}

// ============================================================================
// PARSER DEFINITION
// ============================================================================

/**
 * JSON Schema for GPT function calling.
 * Defines the structure of doc content to extract.
 */
export interface DocFunctionSchema {
  type: 'object';
  properties: Record<string, {
    type: string | string[];
    description: string;
    properties?: Record<string, unknown>;
    required?: string[];
    items?: {
      type: string;
      properties?: Record<string, unknown>;
      required?: string[];
    };
  }>;
  required: string[];
}

/**
 * Parser definition for extracting structured doc content.
 * Used in step 2 of the generation process.
 */
export interface DocParserDefinition<T> {
  /** System prompt for the parsing step */
  systemPrompt: string;

  /** Name of the function for GPT to call */
  functionName: string;

  /** Description of what the function does */
  functionDescription: string;

  /** JSON Schema defining the output structure */
  schema: DocFunctionSchema;

  /** Optional post-processing to clean/validate content */
  postProcess?: (raw: T) => T;
}

// ============================================================================
// TEMPLATE DEFINITION (COMPLETE MODULE)
// ============================================================================

/**
 * Complete doc template definition.
 * Each template folder exports this interface.
 *
 * @example
 * // lib/docs/templates/golden-circle/index.ts
 * export const goldenCircleTemplate: DocTemplateDefinition<GoldenCircleContent> = {
 *   config,
 *   buildPrompt,
 *   parser,
 *   renderMarkdown,
 *   generateTitle,
 * };
 */
export interface DocTemplateDefinition<T = unknown> {
  /** Template metadata and requirements */
  config: DocTemplateConfig;

  /** Builds the analysis prompt from brand data */
  buildPrompt: (brandData: BrandData) => string;

  /** Parser definition for structured extraction */
  parser: DocParserDefinition<T>;

  /** Converts parsed content to markdown for export */
  renderMarkdown: (content: T, brandName: string) => string;

  /** Generates the doc title from brand data */
  generateTitle: (brandData: BrandData) => string;
}

// ============================================================================
// GENERATION TYPES
// ============================================================================

/**
 * Input for generating a doc.
 */
export interface DocGenerationInput {
  /** The brand ID to generate a doc for */
  brandId: string;

  /** Which template to use */
  templateId: DocTemplateId;

  /** Pre-aggregated brand data (if available, avoids re-fetching) */
  brandData?: BrandData;
}

/**
 * Result from generating a doc.
 */
export interface DocGenerationResult<T = unknown> {
  /** Whether generation succeeded */
  success: boolean;

  /** The generated doc ID (if successful) */
  docId?: string;

  /** Raw analysis text from step 1 */
  rawContent?: string;

  /** Parsed structured content */
  parsedContent?: T;

  /** Rendered markdown */
  markdown?: string;

  /** Error message (if failed) */
  error?: string;

  /** How long generation took in milliseconds */
  durationMs: number;
}

// ============================================================================
// READINESS CHECK TYPES
// ============================================================================

/**
 * Missing data detail for readiness checks.
 */
export interface MissingField {
  /** Which analyzer the field belongs to */
  analyzer: AnalyzerType;

  /** The field name that's missing */
  field: string;

  /** Human-readable description */
  description: string;
}

/**
 * Result of checking if a brand has sufficient data for a template.
 */
export interface ReadinessCheckResult {
  /** Whether the brand is ready for this template */
  isReady: boolean;

  /** Which analyzers are complete */
  completedAnalyzers: AnalyzerType[];

  /** Which analyzers are missing */
  missingAnalyzers: AnalyzerType[];

  /** Specific fields that are missing (if any) */
  missingFields: MissingField[];
}
