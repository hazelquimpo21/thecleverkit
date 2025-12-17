/**
 * ANALYZER REGISTRY
 * ==================
 * Central registry of all analyzers.
 * Import from here to access any analyzer or get the full list.
 *
 * Usage:
 *   import { analyzers, analyzerIds, getAnalyzer } from '@/lib/analyzers';
 *
 *   const basicsAnalyzer = getAnalyzer('basics');
 *   const allConfigs = analyzerConfigs;
 */

import * as basics from './basics';
import * as customer from './customer';
import * as products from './products';

import type { AnalyzerDefinition, AnalyzerConfig } from './types';
import type { AnalyzerType } from '@/types';

// ============================================================================
// ANALYZER DEFINITIONS
// ============================================================================

/**
 * Map of all analyzer definitions.
 * Each analyzer has config, buildPrompt, and parser.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const analyzers: Record<AnalyzerType, AnalyzerDefinition<any>> = {
  basics: {
    config: basics.config,
    buildPrompt: basics.buildPrompt,
    parser: basics.parser,
  },
  customer: {
    config: customer.config,
    buildPrompt: customer.buildPrompt,
    parser: customer.parser,
  },
  products: {
    config: products.config,
    buildPrompt: products.buildPrompt,
    parser: products.parser,
  },
};

// ============================================================================
// HELPER EXPORTS
// ============================================================================

/**
 * List of all analyzer IDs.
 */
export const analyzerIds: AnalyzerType[] = ['basics', 'customer', 'products'];

/**
 * List of all analyzer configs (for UI rendering).
 */
export const analyzerConfigs: AnalyzerConfig[] = analyzerIds.map(
  id => analyzers[id].config
);

/**
 * Get a specific analyzer definition by ID.
 *
 * @param id - The analyzer type
 * @returns The analyzer definition
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAnalyzer(id: AnalyzerType): AnalyzerDefinition<any> {
  const analyzer = analyzers[id];
  if (!analyzer) {
    throw new Error(`Unknown analyzer: ${id}`);
  }
  return analyzer;
}

/**
 * Get analyzer config by ID.
 *
 * @param id - The analyzer type
 * @returns The analyzer config
 */
export function getAnalyzerConfig(id: AnalyzerType): AnalyzerConfig {
  return getAnalyzer(id).config;
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export * from './types';
