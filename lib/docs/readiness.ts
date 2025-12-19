/**
 * DOC READINESS CHECKER
 * ======================
 * Checks if a brand has sufficient data to generate a specific doc template.
 *
 * Usage:
 *   import { checkDocReadiness, checkAllTemplatesReadiness } from '@/lib/docs/readiness';
 *
 *   const result = checkDocReadiness(analysisRuns, 'golden-circle');
 *   if (result.isReady) {
 *     // Can generate the doc
 *   }
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

import { getDocTemplate, docTemplateIds } from './registry';
import { log } from '@/lib/utils/logger';
import type { AnalysisRun, AnalyzerType } from '@/types';
import type { DocTemplateId } from '@/types/docs';
import type { BrandData, MissingField, ReadinessCheckResult } from './types';

// ============================================================================
// FIELD DESCRIPTIONS (for user-friendly messages)
// ============================================================================

const fieldDescriptions: Record<string, string> = {
  // Basics fields
  business_name: 'Business name',
  business_description: 'Business description',
  business_model: 'Business model type',
  industry: 'Industry',
  founder_name: 'Founder name',
  founded_year: 'Year founded',

  // Customer fields
  primary_problem: 'Primary customer problem',
  secondary_problems: 'Secondary problems',
  buying_motivation: 'Buying motivation',
  customer_sophistication: 'Customer sophistication level',
  subcultures: 'Target subcultures',

  // Products fields
  offerings: 'Product/service offerings',
  offering_type: 'Offering type',
  primary_offer: 'Primary offer',
  price_positioning: 'Price positioning',
};

// ============================================================================
// SINGLE TEMPLATE CHECK
// ============================================================================

/**
 * Check if a brand has sufficient data to generate a specific doc.
 *
 * @param runs - The brand's analysis runs
 * @param templateId - Which template to check
 * @returns Readiness status with details about missing data
 *
 * @example
 * const result = checkDocReadiness(analysisRuns, 'golden-circle');
 * if (!result.isReady) {
 *   console.log('Missing:', result.missingAnalyzers);
 * }
 */
export function checkDocReadiness(
  runs: AnalysisRun[],
  templateId: DocTemplateId
): ReadinessCheckResult {
  const template = getDocTemplate(templateId);
  const { requiredAnalyzers, requiredFields } = template.config;

  log.debug('Checking doc readiness', { templateId, requiredAnalyzers });

  // Track what's complete and missing
  const completedAnalyzers: AnalyzerType[] = [];
  const missingAnalyzers: AnalyzerType[] = [];
  const missingFields: MissingField[] = [];

  // Check each required analyzer
  for (const analyzerType of requiredAnalyzers) {
    const run = runs.find(r => r.analyzer_type === analyzerType);

    if (!run || run.status !== 'complete' || !run.parsed_data) {
      // Analyzer not complete
      missingAnalyzers.push(analyzerType);
      continue;
    }

    // Analyzer is complete
    completedAnalyzers.push(analyzerType);

    // Check specific required fields if defined
    const fieldsNeeded = requiredFields?.[analyzerType];
    if (fieldsNeeded && fieldsNeeded.length > 0) {
      for (const field of fieldsNeeded) {
        const value = run.parsed_data[field];
        if (value === null || value === undefined || value === '') {
          missingFields.push({
            analyzer: analyzerType,
            field: field as string,
            description: fieldDescriptions[field] || field,
          });
        }
      }
    }
  }

  // Ready if no missing analyzers and no missing required fields
  const isReady = missingAnalyzers.length === 0 && missingFields.length === 0;

  log.debug('Readiness check complete', {
    templateId,
    isReady,
    completedAnalyzers,
    missingAnalyzers,
    missingFieldCount: missingFields.length,
  });

  return {
    isReady,
    completedAnalyzers,
    missingAnalyzers,
    missingFields,
  };
}

// ============================================================================
// ALL TEMPLATES CHECK
// ============================================================================

/**
 * Check readiness for all available templates.
 * Useful for showing template grid with status badges.
 *
 * @param runs - The brand's analysis runs
 * @returns Map of template ID to readiness result
 *
 * @example
 * const readiness = checkAllTemplatesReadiness(runs);
 * for (const [id, result] of readiness) {
 *   console.log(`${id}: ${result.isReady ? 'Ready' : 'Not ready'}`);
 * }
 */
export function checkAllTemplatesReadiness(
  runs: AnalysisRun[]
): Map<DocTemplateId, ReadinessCheckResult> {
  const results = new Map<DocTemplateId, ReadinessCheckResult>();

  for (const templateId of docTemplateIds) {
    results.set(templateId, checkDocReadiness(runs, templateId));
  }

  return results;
}

// ============================================================================
// BUILD BRAND DATA
// ============================================================================

/**
 * Build brand data object from analysis runs.
 * Used as input to doc generation prompts.
 *
 * @param brandName - The brand's display name
 * @param sourceUrl - The brand's website URL
 * @param runs - The brand's analysis runs
 * @returns Aggregated brand data for templates
 */
export function buildBrandDataFromRuns(
  brandName: string,
  sourceUrl: string,
  runs: AnalysisRun[]
): BrandData {
  // Find completed runs by type
  const basicsRun = runs.find(r => r.analyzer_type === 'basics' && r.status === 'complete');
  const customerRun = runs.find(r => r.analyzer_type === 'customer' && r.status === 'complete');
  const productsRun = runs.find(r => r.analyzer_type === 'products' && r.status === 'complete');

  return {
    brandName,
    sourceUrl,
    basics: basicsRun?.parsed_data as BrandData['basics'],
    customer: customerRun?.parsed_data as BrandData['customer'],
    products: productsRun?.parsed_data as BrandData['products'],
  };
}
