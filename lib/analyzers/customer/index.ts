/**
 * CUSTOMER ANALYZER
 * ==================
 * Extracts customer profile information:
 * - Target subcultures/communities
 * - Primary problem solved
 * - Secondary problems
 * - Customer sophistication level
 * - Primary buying motivation
 */

export { config } from './config';
export { buildPrompt } from './prompt';
export { parser } from './parser';
export * from './types';
