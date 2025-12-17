/**
 * SUPABASE INDEX
 * ===============
 * Central export for all Supabase-related functionality.
 */

// Clients
export { createBrowserClient } from './client';
export { createServerClient, createAdminClient } from './server';

// Database helpers
export * from './brands';
export * from './analysis-runs';
