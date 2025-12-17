/**
 * PRODUCTS ANALYZER PARSER
 * =========================
 * Defines the function schema for extracting product/pricing data.
 *
 * This is STEP 2 of the two-step AI process.
 */

import type { ParserDefinition } from '../types';
import type { ParsedProducts } from './types';

export const parser: ParserDefinition<ParsedProducts> = {
  systemPrompt: `You are a precise data extraction assistant.
Read the products analysis below and extract the requested fields.
Be specific about product names and prices when they're mentioned.
If prices aren't shown, use null for the price field.`,

  functionName: 'extract_products',
  functionDescription: 'Extract product and pricing information from the analysis',

  schema: {
    type: 'object',
    properties: {
      offering_type: {
        type: 'string',
        enum: ['Products', 'Services', 'Both', 'Unclear'],
        description: 'Whether the business primarily sells products, services, or both',
      },
      offerings: {
        type: 'array',
        description: 'List of specific products or services offered',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the product or service',
            },
            description: {
              type: 'string',
              description: 'Brief description of what it is',
            },
            price: {
              type: ['string', 'null'],
              description: 'Price if shown (e.g., "$99", "$49/mo"), null if not visible',
            },
            pricing_model: {
              type: 'string',
              enum: [
                'One-time',
                'Subscription',
                'Retainer',
                'Project-based',
                'Custom/Contact',
                'Free',
                'Freemium',
                'Unknown',
              ],
              description: 'How the product/service is priced',
            },
          },
          required: ['name', 'description', 'pricing_model'],
        },
      },
      primary_offer: {
        type: 'string',
        description: 'The main product or service they want customers to buy',
      },
      price_positioning: {
        type: 'string',
        enum: ['Budget', 'Mid-market', 'Premium', 'Luxury', 'Unclear'],
        description: 'Where they position themselves in the market price-wise',
      },
    },
    required: ['offering_type', 'offerings', 'primary_offer', 'price_positioning'],
  },

  postProcess: (raw: ParsedProducts): ParsedProducts => {
    return {
      ...raw,
      // Ensure offerings array exists
      offerings: raw.offerings?.length > 0
        ? raw.offerings.map(o => ({
            ...o,
            name: o.name?.trim() || 'Unknown offering',
            description: o.description?.trim() || '',
            price: o.price?.trim() || null,
          }))
        : [{
            name: 'Primary offering',
            description: 'Details not found on website',
            price: null,
            pricing_model: 'Unknown',
          }],
      primary_offer: raw.primary_offer?.trim() || 'Not clearly defined',
    };
  },
};
