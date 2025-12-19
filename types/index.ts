/**
 * TYPES INDEX
 * ============
 * Central export point for all TypeScript types.
 * Import from '@/types' instead of individual files.
 *
 * @update 2025-12-19 - Added docs types for generated documents feature
 */

// Database types (match Supabase schema)
export * from './database';

// Analyzer output types (parsed GPT results)
export * from './analyzers';

// Generated docs types (brand documents feature)
export * from './docs';
