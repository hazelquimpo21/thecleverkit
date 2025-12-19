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
 * @update 2025-12-19 - Added coming-soon templates for store display
 */

import { FileText, Users } from 'lucide-react';
import { goldenCircleTemplate } from './templates/golden-circle';
import type { DocTemplateConfig, DocTemplateDefinition, TemplateCategory } from './types';
import type { DocTemplateId } from '@/types/docs';

// ============================================================================
// COMING SOON TEMPLATE CONFIGS
// ============================================================================

/**
 * Config-only definitions for templates that are coming soon.
 * These appear in the store but cannot be generated yet.
 */
const comingSoonConfigs: DocTemplateConfig[] = [
  {
    id: 'brand-brief',
    name: 'Brand Brief',
    description: 'Complete brand overview document for stakeholders',
    shortDescription: 'One-page brand overview for sharing',
    icon: FileText,
    category: 'strategy',
    status: 'coming_soon',
    requiredAnalyzers: ['basics', 'customer', 'products'],
  },
  {
    id: 'customer-persona',
    name: 'Customer Persona',
    description: 'Detailed ideal customer profile with demographics and psychographics',
    shortDescription: 'Bring your target audience to life',
    icon: Users,
    category: 'audience',
    status: 'coming_soon',
    requiredAnalyzers: ['customer'],
  },
];

// ============================================================================
// TEMPLATE REGISTRY
// ============================================================================

/**
 * Map of fully implemented doc template definitions.
 * Each template has config, buildPrompt, parser, renderMarkdown, and generateTitle.
 *
 * @update Add new templates here when created
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const docTemplates: Partial<Record<DocTemplateId, DocTemplateDefinition<any>>> = {
  'golden-circle': goldenCircleTemplate,
};

// ============================================================================
// HELPER EXPORTS
// ============================================================================

/**
 * List of implemented doc template IDs.
 * Use for iterating over available (generatable) templates.
 */
export const docTemplateIds: DocTemplateId[] = Object.keys(docTemplates) as DocTemplateId[];

/**
 * List of implemented doc template configs (for UI rendering).
 * Includes name, description, icon, and requirements.
 */
export const docTemplateConfigs: DocTemplateConfig[] = docTemplateIds.map(
  id => docTemplates[id]!.config
);

/**
 * All template configs including coming-soon templates.
 * Use this for the Template Store display.
 */
export const allTemplateConfigs: DocTemplateConfig[] = [
  ...docTemplateConfigs,
  ...comingSoonConfigs,
];

/**
 * Get all templates grouped by category.
 * Sorted by category order, with available templates first.
 */
export function getTemplatesByCategory(): Record<TemplateCategory, DocTemplateConfig[]> {
  const grouped: Record<TemplateCategory, DocTemplateConfig[]> = {
    strategy: [],
    audience: [],
    content: [],
    sales: [],
  };

  for (const config of allTemplateConfigs) {
    grouped[config.category].push(config);
  }

  // Sort each category: available first, then by name
  for (const category of Object.keys(grouped) as TemplateCategory[]) {
    grouped[category].sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'available' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  return grouped;
}

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
 * Get doc template config by ID (works for both available and coming-soon).
 *
 * @param id - The template ID
 * @returns The template config (metadata only)
 *
 * @example
 * const config = getDocTemplateConfig('golden-circle');
 * console.log(config.name); // "Golden Circle"
 */
export function getDocTemplateConfig(id: DocTemplateId): DocTemplateConfig | undefined {
  return allTemplateConfigs.find(c => c.id === id);
}

/**
 * Check if a template ID has a full implementation (can be generated).
 *
 * @param id - The template ID to check
 * @returns True if the template is implemented
 */
export function isImplementedTemplateId(id: string): boolean {
  return id in docTemplates;
}

/**
 * Check if a template ID is valid (including coming-soon).
 *
 * @param id - The template ID to check
 * @returns True if the template exists
 */
export function isValidTemplateId(id: string): id is DocTemplateId {
  return allTemplateConfigs.some(c => c.id === id);
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export * from './types';
