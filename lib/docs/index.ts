/**
 * DOCS MODULE
 * ============
 * Central export point for the docs feature.
 * Import from '@/lib/docs' instead of individual files.
 *
 * @created 2025-12-19 - Initial docs feature implementation
 *
 * Usage:
 *   import { generateDoc, checkDocReadiness, getDocTemplate } from '@/lib/docs';
 */

// Generator functions
export { generateDoc, generateDocTitle, docLog } from './generator';

// Registry and template access
export {
  docTemplates,
  docTemplateIds,
  docTemplateConfigs,
  allTemplateConfigs,
  getDocTemplate,
  getDocTemplateConfig,
  getTemplatesByCategory,
  isValidTemplateId,
  isImplementedTemplateId,
} from './registry';

// Readiness checking
export {
  checkDocReadiness,
  checkAllTemplatesReadiness,
  buildBrandDataFromRuns,
} from './readiness';

// Doc state utilities (for intelligent buttons)
export {
  getDocState,
  getLatestDocForTemplate,
  countDocsForTemplate,
  isDocStale,
  isExportStale,
  getAllDocStates,
  type DocState,
  type DocGenerationState,
  type DocExportState,
  type DocPrimaryAction,
} from './state';

// Types
export * from './types';

// Template exports (for direct access to specific templates)
export { goldenCircleTemplate } from './templates/golden-circle';
