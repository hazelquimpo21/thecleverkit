/**
 * ANALYZER SHARED TYPES
 * ======================
 * Types used across all analyzers for consistent structure.
 * Each analyzer implements these interfaces.
 */

import type { LucideIcon } from 'lucide-react';
import type { AnalyzerType } from '@/types';

// ============================================================================
// ANALYZER CONFIG
// ============================================================================

/**
 * Configuration for an analyzer.
 * Defines metadata and dependencies.
 */
export interface AnalyzerConfig {
  /** Unique identifier (must match database enum) */
  id: AnalyzerType;

  /** Display name for UI */
  name: string;

  /** Short description for users */
  description: string;

  /** Icon component from lucide-react */
  icon: LucideIcon;

  /** IDs of analyzers that must complete first */
  dependsOn: AnalyzerType[];
}

// ============================================================================
// PROMPT BUILDER
// ============================================================================

/**
 * Prior analysis results from dependent analyzers.
 * Used when an analyzer needs context from previous runs.
 */
export type PriorResults = Record<string, unknown>;

/**
 * Function that builds the analysis prompt.
 *
 * @param scrapedContent - The raw scraped website content
 * @param priorResults - Results from dependent analyzers (if any)
 * @returns The prompt string to send to GPT
 */
export type PromptBuilder = (
  scrapedContent: string,
  priorResults?: PriorResults
) => string;

// ============================================================================
// PARSER DEFINITION
// ============================================================================

/**
 * JSON Schema for GPT function calling.
 * Defines the structure of data to extract.
 */
export interface FunctionSchema {
  type: 'object';
  properties: Record<string, {
    type: string | string[];
    description: string;
    enum?: string[];
    items?: {
      type: string;
      properties?: Record<string, unknown>;
      required?: string[];
    };
  }>;
  required: string[];
}

/**
 * Parser definition for extracting structured data.
 * Used in step 2 of the analysis process.
 */
export interface ParserDefinition<T> {
  /** System prompt for the parsing step */
  systemPrompt: string;

  /** Name of the function for GPT to call */
  functionName: string;

  /** Description of what the function does */
  functionDescription: string;

  /** JSON Schema defining the output structure */
  schema: FunctionSchema;

  /** Optional post-processing to clean/validate data */
  postProcess?: (raw: T) => T;
}

// ============================================================================
// ANALYZER DEFINITION (COMPLETE MODULE)
// ============================================================================

/**
 * Complete analyzer definition.
 * Combines config, prompt builder, and parser.
 */
export interface AnalyzerDefinition<T = unknown> {
  config: AnalyzerConfig;
  buildPrompt: PromptBuilder;
  parser: ParserDefinition<T>;
}

// ============================================================================
// EXECUTION TYPES
// ============================================================================

/**
 * Input for running an analyzer.
 */
export interface AnalyzerInput {
  brandId: string;
  analyzerType: AnalyzerType;
  scrapedContent: string;
  priorResults?: PriorResults;
}

/**
 * Result from running an analyzer.
 */
export interface AnalyzerResult<T = unknown> {
  success: boolean;
  rawAnalysis?: string;
  parsedData?: T;
  error?: string;
  durationMs: number;
}
