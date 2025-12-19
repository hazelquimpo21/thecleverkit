/**
 * DOC GENERATOR
 * ==============
 * Orchestrates the generation of documents from brand data.
 * Follows the same two-step AI pattern as analyzers.
 *
 * Usage:
 *   import { generateDoc } from '@/lib/docs/generator';
 *
 *   const result = await generateDoc({
 *     brandId: 'uuid',
 *     templateId: 'golden-circle',
 *     brandData,
 *   });
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

import { getDocTemplate } from './registry';
import { analyzeWithGPT, parseWithGPT } from '@/lib/api/openai';
import { log } from '@/lib/utils/logger';
import type { DocTemplateId } from '@/types/docs';
import type { BrandData, DocGenerationResult } from './types';

// ============================================================================
// LOGGING HELPERS
// ============================================================================

/**
 * Specialized logger for doc generation operations.
 * Provides consistent formatting for generation status updates.
 */
export const docLog = {
  start: (templateId: DocTemplateId, brandId: string): void => {
    log.info(`📄 Doc generation starting: ${templateId}`, { brandId });
  },

  analyzing: (templateId: DocTemplateId): void => {
    log.info(`🔄 Generating content: ${templateId}`);
  },

  parsing: (templateId: DocTemplateId): void => {
    log.info(`📋 Parsing structure: ${templateId}`);
  },

  rendering: (templateId: DocTemplateId): void => {
    log.info(`✍️ Rendering markdown: ${templateId}`);
  },

  complete: (templateId: DocTemplateId, duration: number): void => {
    const durationStr = `${(duration / 1000).toFixed(2)}s`;
    log.success(`Doc generated: ${templateId}`, { duration: durationStr });
  },

  error: (templateId: DocTemplateId, error: string): void => {
    log.error(`Doc generation failed: ${templateId}`, { error });
  },
};

// ============================================================================
// MAIN GENERATOR
// ============================================================================

/**
 * Generate a document from brand data.
 *
 * This is the core generation function that:
 * 1. Builds the analysis prompt from brand data
 * 2. Runs the prompt through GPT (natural language generation)
 * 3. Parses the output into structured content (function calling)
 * 4. Renders the content as markdown
 *
 * Note: This function does NOT save to database - that's handled by the API route.
 *
 * @param input - Generation input with template ID and brand data
 * @returns Generation result with content and markdown
 *
 * @example
 * const result = await generateDoc({
 *   brandId: 'uuid',
 *   templateId: 'golden-circle',
 *   brandData: { brandName: 'Acme', basics, customer, products },
 * });
 *
 * if (result.success) {
 *   console.log(result.markdown);
 * }
 */
export async function generateDoc(input: {
  brandId: string;
  templateId: DocTemplateId;
  brandData: BrandData;
}): Promise<DocGenerationResult> {
  const { brandId, templateId, brandData } = input;
  const startTime = Date.now();

  docLog.start(templateId, brandId);

  try {
    // Get the template definition
    const template = getDocTemplate(templateId);

    // ========================================
    // STEP 1: Analysis (natural language generation)
    // ========================================

    docLog.analyzing(templateId);

    // Build the prompt from brand data
    const prompt = template.buildPrompt(brandData);

    // Run GPT analysis
    const analysisResult = await analyzeWithGPT(prompt, {
      maxTokens: 2500, // Docs need more tokens than analyzers
      temperature: 0.7,
    });

    if (!analysisResult.success || !analysisResult.content) {
      throw new Error(analysisResult.error || 'Content generation failed');
    }

    const rawContent = analysisResult.content;

    // ========================================
    // STEP 2: Parsing (structured extraction)
    // ========================================

    docLog.parsing(templateId);

    // Run GPT parsing with function calling
    const parseResult = await parseWithGPT(
      rawContent,
      template.parser.systemPrompt,
      template.parser.functionName,
      template.parser.functionDescription,
      template.parser.schema
    );

    if (!parseResult.success || !parseResult.data) {
      throw new Error(parseResult.error || 'Content parsing failed');
    }

    // Apply post-processing if defined
    let parsedContent = parseResult.data;
    if (template.parser.postProcess) {
      parsedContent = template.parser.postProcess(parsedContent as never);
    }

    // ========================================
    // STEP 3: Render markdown
    // ========================================

    docLog.rendering(templateId);

    const markdown = template.renderMarkdown(parsedContent, brandData.brandName);

    // ========================================
    // Return result
    // ========================================

    const duration = Date.now() - startTime;
    docLog.complete(templateId, duration);

    return {
      success: true,
      rawContent,
      parsedContent,
      markdown,
      durationMs: duration,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const duration = Date.now() - startTime;

    docLog.error(templateId, errorMessage);

    return {
      success: false,
      error: errorMessage,
      durationMs: duration,
    };
  }
}

// ============================================================================
// TITLE GENERATION
// ============================================================================

/**
 * Generate a document title using the template's title generator.
 *
 * @param templateId - Which template to use
 * @param brandData - Brand data for title generation
 * @returns The generated title string
 */
export function generateDocTitle(
  templateId: DocTemplateId,
  brandData: BrandData
): string {
  const template = getDocTemplate(templateId);
  return template.generateTitle(brandData);
}
