/**
 * GOLDEN CIRCLE PARSER
 * =====================
 * Defines the function schema and post-processing for Golden Circle extraction.
 *
 * This is STEP 2 of the two-step AI process.
 * Takes natural language analysis and extracts structured Why/How/What content.
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

import type { DocParserDefinition } from '../../types';
import type { GoldenCircleContent } from './types';

// ============================================================================
// PARSER DEFINITION
// ============================================================================

export const parser: DocParserDefinition<GoldenCircleContent> = {
  // System prompt for the parsing step
  systemPrompt: `You are a precise content extraction assistant.
Read the Golden Circle analysis below and extract each section into the function call.
For each section (why, how, what), create:
- headline: A single, punchy sentence capturing the core idea
- explanation: 2-3 sentences expanding on the headline with supporting detail

The summary should be one cohesive paragraph (3-4 sentences) that ties why, how, and what together.

Preserve the writer's voice and specific insights. Don't genericize the content.`,

  // Function name for GPT to call
  functionName: 'extract_golden_circle',
  functionDescription: 'Extract the Why, How, What, and Summary sections from a Golden Circle analysis',

  // JSON Schema defining the output structure
  schema: {
    type: 'object',
    properties: {
      why: {
        type: 'object',
        description: 'The brand\'s purpose, cause, or belief (Why they exist)',
        properties: {
          headline: {
            type: 'string',
            description: 'One sentence capturing the core purpose',
          },
          explanation: {
            type: 'string',
            description: '2-3 sentences expanding on the purpose with specifics',
          },
        },
        required: ['headline', 'explanation'],
      },
      how: {
        type: 'object',
        description: 'The brand\'s differentiating approach (How they deliver value)',
        properties: {
          headline: {
            type: 'string',
            description: 'One sentence capturing their unique approach',
          },
          explanation: {
            type: 'string',
            description: '2-3 sentences explaining their method or process',
          },
        },
        required: ['headline', 'explanation'],
      },
      what: {
        type: 'object',
        description: 'The brand\'s products or services (What they offer)',
        properties: {
          headline: {
            type: 'string',
            description: 'One sentence summarizing their offerings',
          },
          explanation: {
            type: 'string',
            description: '2-3 sentences detailing their products/services',
          },
        },
        required: ['headline', 'explanation'],
      },
      summary: {
        type: 'string',
        description: 'One paragraph (3-4 sentences) tying why, how, and what together into a cohesive brand story',
      },
    },
    required: ['why', 'how', 'what', 'summary'],
  },

  // Post-processing to clean up the output
  postProcess: (raw: GoldenCircleContent): GoldenCircleContent => {
    return {
      why: {
        headline: raw.why?.headline?.trim() || 'Purpose to be defined',
        explanation: raw.why?.explanation?.trim() || '',
      },
      how: {
        headline: raw.how?.headline?.trim() || 'Approach to be defined',
        explanation: raw.how?.explanation?.trim() || '',
      },
      what: {
        headline: raw.what?.headline?.trim() || 'Offerings to be defined',
        explanation: raw.what?.explanation?.trim() || '',
      },
      summary: raw.summary?.trim() || '',
    };
  },
};
