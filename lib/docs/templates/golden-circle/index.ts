/**
 * GOLDEN CIRCLE TEMPLATE
 * =======================
 * Complete doc template for Simon Sinek's Golden Circle framework.
 * Helps brands articulate their Why, How, and What.
 *
 * Usage:
 *   import { goldenCircleTemplate } from '@/lib/docs/templates/golden-circle';
 *
 *   const prompt = goldenCircleTemplate.buildPrompt(brandData);
 *   const markdown = goldenCircleTemplate.renderMarkdown(content, brandName);
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

import { config } from './config';
import { buildPrompt } from './prompt';
import { parser } from './parser';
import { renderMarkdown, generateTitle } from './renderer';
import type { DocTemplateDefinition } from '../../types';
import type { GoldenCircleContent } from './types';

// ============================================================================
// TEMPLATE EXPORT
// ============================================================================

/**
 * Complete Golden Circle template definition.
 * Implements DocTemplateDefinition for the doc generator.
 */
export const goldenCircleTemplate: DocTemplateDefinition<GoldenCircleContent> = {
  config,
  buildPrompt,
  parser,
  renderMarkdown,
  generateTitle,
};

// ============================================================================
// RE-EXPORTS
// ============================================================================

// Export individual pieces for direct access
export { config } from './config';
export { buildPrompt } from './prompt';
export { parser } from './parser';
export { renderMarkdown, generateTitle } from './renderer';
export type { GoldenCircleContent, GoldenCircleSection } from './types';
