/**
 * HOOKS INDEX
 * ============
 * Central export point for all custom React hooks.
 * Import from '@/hooks' instead of individual files.
 *
 * @update 2025-12-19 - Added docs hooks for generated documents feature
 */

// Auth hooks
export { useAuth } from './use-auth';
export { useAuthGate } from './use-auth-gate';

// Analysis hooks
export { useRealtimeAnalysis } from './use-realtime-analysis';
export { useBrandAnalysis } from './use-brand-analysis';

// React Query hooks (brand data fetching)
export {
  useBrands,
  useBrand,
  useCreateBrand,
  useDeleteBrand,
  useReanalyzeBrand,
  usePrefetchBrand,
  brandKeys,
} from './use-brands';

// React Query hooks (docs data fetching)
export {
  useBrandDocs,
  useDoc,
  useDocTemplatesReadiness,
  useTemplateReadiness,
  useTemplatesWithReadiness,
  useGenerateDoc,
  useDeleteDoc,
  usePrefetchDoc,
  docKeys,
} from './use-docs';
