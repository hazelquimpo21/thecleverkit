/**
 * BASICS ANALYZER PARSER
 * =======================
 * Defines the function schema and post-processing for basics extraction.
 *
 * This is STEP 2 of the two-step AI process.
 * Takes natural language analysis and extracts structured fields.
 */

import type { ParserDefinition } from '../types';
import type { ParsedBasics } from './types';
import { decodeHtmlEntities } from '@/lib/utils/format';

export const parser: ParserDefinition<ParsedBasics> = {
  // System prompt for the parsing step
  systemPrompt: `You are a precise data extraction assistant.
Read the brand analysis below and extract the requested fields into the function call.
If something wasn't mentioned or is genuinely unclear, use null for optional fields.
For required fields, make your best inference from context.`,

  // Function name for GPT to call
  functionName: 'extract_basics',
  functionDescription: 'Extract basic business information from the analysis',

  // JSON Schema defining the output structure
  schema: {
    type: 'object',
    properties: {
      business_name: {
        type: 'string',
        description: 'The name of the business',
      },
      founder_name: {
        type: ['string', 'null'],
        description: 'Name of founder if mentioned, null if not found',
      },
      founded_year: {
        type: ['string', 'null'],
        description: 'Year founded, or approximate like "circa 2021", null if not found',
      },
      industry: {
        type: 'string',
        description: 'The industry or space they operate in (e.g., "Marketing Technology", "Health & Wellness", "E-commerce")',
      },
      business_description: {
        type: 'string',
        description: 'A 1-2 sentence description of what the business does',
      },
      business_model: {
        type: 'string',
        enum: [
          'B2B Services',
          'B2C Services',
          'B2B Products',
          'B2C Products',
          'B2B SaaS',
          'B2C SaaS',
          'Marketplace',
          'Agency',
          'Consultancy',
          'Other',
        ],
        description: 'The primary business model',
      },
    },
    required: ['business_name', 'industry', 'business_description', 'business_model'],
  },

  // Post-processing to clean up the output
  // Decodes HTML entities that may come from scraped content or AI responses
  postProcess: (raw: ParsedBasics): ParsedBasics => {
    return {
      ...raw,
      // Decode HTML entities and ensure business name is trimmed and not empty
      business_name: decodeHtmlEntities(raw.business_name?.trim() || '') || 'Unknown Business',
      // Trim and decode other string fields
      industry: decodeHtmlEntities(raw.industry?.trim() || '') || 'Unknown',
      business_description: decodeHtmlEntities(raw.business_description?.trim() || ''),
      founder_name: raw.founder_name ? decodeHtmlEntities(raw.founder_name.trim()) : null,
      founded_year: raw.founded_year?.trim() || null,
    };
  },
};
