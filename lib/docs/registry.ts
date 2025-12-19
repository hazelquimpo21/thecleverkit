/**
 * DOC TEMPLATE REGISTRY
 * ======================
 * Central registry of all doc templates.
 * Import from here to access any template or get the full list.
 *
 * Usage:
 *   import { docTemplates, getDocTemplate, docTemplateIds } from '@/lib/docs/registry';
 *
 *   const template = getDocTemplate('golden-circle');
 *   const allConfigs = docTemplateConfigs;
 *
 * @created 2025-12-19 - Initial docs feature implementation
 * @update When adding a new template, register it here
 */

import { goldenCircleTemplate } from './templates/golden-circle';
import type { DocTemplateConfig, DocTemplateDefinition } from './types';
import type { DocTemplateId } from '@/types/docs';

// ============================================================================
// TEMPLATE REGISTRY
// ============================================================================

/**
 * Map of all doc template definitions.
 * Each template has config, buildPrompt, parser, renderMarkdown, and generateTitle.
 *
 * @update Add new templates here when created
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const docTemplates: Record<DocTemplateId, DocTemplateDefinition<any>> = {
  'golden-circle': goldenCircleTemplate,
  // Future templates:
  // 'brand-brief': brandBriefTemplate,
  // 'customer-persona': customerPersonaTemplate,
};

// ============================================================================
// HELPER EXPORTS
// ============================================================================

/**
 * List of all doc template IDs.
 * Use for iterating over available templates.
 */
export const docTemplateIds: DocTemplateId[] = Object.keys(docTemplates) as DocTemplateId[];

/**
 * List of all doc template configs (for UI rendering).
 * Includes name, description, icon, and requirements.
 */
export const docTemplateConfigs: DocTemplateConfig[] = docTemplateIds.map(
  id => docTemplates[id].config
);

/**
 * Get a specific doc template definition by ID.
 *
 * @param id - The template ID
 * @returns The template definition
 * @throws Error if template ID is unknown
 *
 * @example
 * const template = getDocTemplate('golden-circle');
 * const prompt = template.buildPrompt(brandData);
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDocTemplate(id: DocTemplateId): DocTemplateDefinition<any> {
  const template = docTemplates[id];
  if (!template) {
    throw new Error(`Unknown doc template: ${id}`);
  }
  return template;
}

/**
 * Get doc template config by ID.
 *
 * @param id - The template ID
 * @returns The template config (metadata only)
 *
 * @example
 * const config = getDocTemplateConfig('golden-circle');
 * console.log(config.name); // "Golden Circle"
 */
export function getDocTemplateConfig(id: DocTemplateId): DocTemplateConfig {
  return getDocTemplate(id).config;
}

/**
 * Check if a template ID is valid.
 *
 * @param id - The template ID to check
 * @returns True if the template exists
 */
export function isValidTemplateId(id: string): id is DocTemplateId {
  return id in docTemplates;
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export * from './types';
