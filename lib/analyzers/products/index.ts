/**
 * PRODUCTS ANALYZER
 * ==================
 * Extracts product and pricing information:
 * - Offering type (products/services/both)
 * - List of specific offerings with prices
 * - Primary offer
 * - Price positioning in market
 */

export { config } from './config';
export { buildPrompt } from './prompt';
export { parser } from './parser';
export * from './types';
