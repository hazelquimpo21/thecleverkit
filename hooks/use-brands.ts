/**
 * USE BRANDS HOOK
 * =================
 * React Query hooks for fetching and mutating brand data.
 * Provides optimistic updates and cache management.
 *
 * Usage:
 *   const { data: brands, isLoading } = useBrands();
 *   const { data: brand } = useBrand(brandId);
 *   const createBrand = useCreateBrand();
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@/lib/supabase/client';
import { toast } from '@/components/ui/sonner';
import { log } from '@/lib/utils/logger';
import type { BrandWithAnalyses } from '@/types';

// ============================================================================
// QUERY KEYS
// ============================================================================

/**
 * Query key factory for brands.
 * Structured keys enable fine-grained cache invalidation.
 */
export const brandKeys = {
  all: ['brands'] as const,
  lists: () => [...brandKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...brandKeys.lists(), filters] as const,
  details: () => [...brandKeys.all, 'detail'] as const,
  detail: (id: string) => [...brandKeys.details(), id] as const,
};

// ============================================================================
// FETCH FUNCTIONS
// ============================================================================

/**
 * Fetch all brands for the current user.
 * Includes analysis_runs for status display on dashboard cards.
 */
async function fetchBrands(): Promise<BrandWithAnalyses[]> {
  const supabase = createBrowserClient();

  if (!supabase) {
    log.warn('Supabase client not available');
    return [];
  }

  const { data, error } = await supabase
    .from('brands')
    .select('*, analysis_runs(*)')
    .order('updated_at', { ascending: false });

  if (error) {
    log.error('Failed to fetch brands', { error: error.message });
    throw new Error(error.message);
  }

  return (data ?? []) as BrandWithAnalyses[];
}

/**
 * Fetch a single brand with its analysis runs.
 */
async function fetchBrand(brandId: string): Promise<BrandWithAnalyses> {
  const supabase = createBrowserClient();

  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  const { data, error } = await supabase
    .from('brands')
    .select('*, analysis_runs(*)')
    .eq('id', brandId)
    .single();

  if (error) {
    log.error('Failed to fetch brand', { brandId, error: error.message });
    throw new Error(error.message);
  }

  return data as BrandWithAnalyses;
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch all brands for the current user.
 *
 * @example
 * const { data: brands, isLoading, error } = useBrands();
 */
export function useBrands() {
  return useQuery({
    queryKey: brandKeys.lists(),
    queryFn: fetchBrands,
  });
}

/**
 * Hook to fetch a single brand with its analysis runs.
 *
 * @param brandId - The ID of the brand to fetch
 *
 * @example
 * const { data: brand, isLoading } = useBrand('uuid-here');
 */
export function useBrand(brandId: string) {
  return useQuery({
    queryKey: brandKeys.detail(brandId),
    queryFn: () => fetchBrand(brandId),
    enabled: !!brandId,
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

interface CreateBrandInput {
  url: string;
  isOwnBrand?: boolean;
}

/**
 * Hook to create a new brand and start analysis.
 * Invalidates the brands list cache on success.
 *
 * @example
 * const createBrand = useCreateBrand();
 * await createBrand.mutateAsync({ url: 'https://example.com' });
 */
export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBrandInput): Promise<{ brandId: string }> => {
      log.info('Creating brand', { url: input.url });

      const response = await fetch('/api/brands/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: input.url,
          isOwnBrand: input.isOwnBrand ?? false,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create brand');
      }

      const data = await response.json();
      log.success('Brand created', { brandId: data.brandId });

      return { brandId: data.brandId };
    },
    onSuccess: () => {
      // Invalidate brands list to show the new brand
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
      toast.success('Brand analysis started!');
    },
    onError: (error) => {
      log.error('Failed to create brand', { error: error.message });
      toast.error(error.message);
    },
  });
}

/**
 * Hook to delete a brand.
 * Invalidates the brands list cache on success.
 *
 * @example
 * const deleteBrand = useDeleteBrand();
 * await deleteBrand.mutateAsync('uuid-here');
 */
export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brandId: string): Promise<void> => {
      const supabase = createBrowserClient();

      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      log.info('Deleting brand', { brandId });

      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brandId);

      if (error) {
        throw new Error(error.message);
      }

      log.success('Brand deleted', { brandId });
    },
    onSuccess: (_, brandId) => {
      // Invalidate brands list
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
      // Remove the specific brand from cache
      queryClient.removeQueries({ queryKey: brandKeys.detail(brandId) });
      toast.success('Brand deleted');
    },
    onError: (error) => {
      log.error('Failed to delete brand', { error: error.message });
      toast.error(error.message);
    },
  });
}

/**
 * Hook to re-analyze a brand.
 * Triggers a fresh scrape and analysis.
 *
 * @example
 * const reanalyze = useReanalyzeBrand();
 * await reanalyze.mutateAsync('uuid-here');
 */
export function useReanalyzeBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brandId: string): Promise<void> => {
      log.info('Re-analyzing brand', { brandId });

      // TODO: Implement re-analyze API endpoint
      // For now, this is a placeholder
      throw new Error('Re-analyze not yet implemented');
    },
    onSuccess: (_, brandId) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.detail(brandId) });
      toast.success('Re-analysis started!');
    },
  });
}

// ============================================================================
// PREFETCH UTILITIES
// ============================================================================

/**
 * Prefetch a brand's data for faster navigation.
 * Use this when hovering over a brand link.
 *
 * @example
 * <Link
 *   href={`/brands/${brand.id}`}
 *   onMouseEnter={() => prefetchBrand(brand.id)}
 * >
 */
export function usePrefetchBrand() {
  const queryClient = useQueryClient();

  return (brandId: string) => {
    queryClient.prefetchQuery({
      queryKey: brandKeys.detail(brandId),
      queryFn: () => fetchBrand(brandId),
    });
  };
}
