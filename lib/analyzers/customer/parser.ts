/**
 * CUSTOMER ANALYZER PARSER
 * =========================
 * Defines the function schema for extracting customer profile data.
 *
 * This is STEP 2 of the two-step AI process.
 */

import type { ParserDefinition } from '../types';
import type { ParsedCustomer } from './types';

export const parser: ParserDefinition<ParsedCustomer> = {
  systemPrompt: `You are a precise data extraction assistant.
Read the customer analysis below and extract the requested fields.
Be specific and concrete with your extractions.
For arrays, include 2-5 relevant items.`,

  functionName: 'extract_customer_profile',
  functionDescription: 'Extract customer profile information from the analysis',

  schema: {
    type: 'object',
    properties: {
      subcultures: {
        type: 'array',
        description: 'List of 2-5 subcultures, communities, or identities the target customers belong to (e.g., "startup founders", "remote workers", "eco-conscious consumers")',
        items: {
          type: 'string',
        },
      },
      primary_problem: {
        type: 'string',
        description: 'The main problem or pain point the business solves for customers (1-2 sentences)',
      },
      secondary_problems: {
        type: 'array',
        description: 'List of 2-4 related secondary problems customers face',
        items: {
          type: 'string',
        },
      },
      customer_sophistication: {
        type: 'string',
        enum: ['Beginner', 'Informed', 'Expert'],
        description: 'How knowledgeable the target customer is about the problem/solution space',
      },
      buying_motivation: {
        type: 'string',
        enum: ['Pain relief', 'Aspiration', 'Necessity', 'Curiosity', 'Status'],
        description: 'The primary motivation driving purchase decisions',
      },
    },
    required: [
      'subcultures',
      'primary_problem',
      'secondary_problems',
      'customer_sophistication',
      'buying_motivation',
    ],
  },

  postProcess: (raw: ParsedCustomer): ParsedCustomer => {
    return {
      ...raw,
      // Ensure arrays have content
      subcultures: raw.subcultures?.length > 0 ? raw.subcultures : ['General consumers'],
      secondary_problems: raw.secondary_problems?.length > 0
        ? raw.secondary_problems
        : ['Other related challenges'],
      // Trim strings
      primary_problem: raw.primary_problem?.trim() || 'Not clearly defined',
    };
  },
};
