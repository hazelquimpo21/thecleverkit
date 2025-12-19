/**
 * USE DOCS HOOKS
 * ===============
 * React Query hooks for fetching and mutating generated docs.
 * Provides optimistic updates, cache management, and readiness checks.
 *
 * Usage:
 *   const { data: docs, isLoading } = useBrandDocs(brandId);
 *   const generateDoc = useGenerateDoc();
 *   const { data: readiness } = useDocReadiness(brandId);
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { toast } from '@/components/ui/sonner';
import { log } from '@/lib/utils/logger';
import {
  checkDocReadiness,
  checkAllTemplatesReadiness,
  docTemplateConfigs,
  docTemplateIds,
} from '@/lib/docs';
import type { GeneratedDoc, DocTemplateId, AnalysisRun } from '@/types';
import type { ReadinessCheckResult } from '@/lib/docs/types';

// ============================================================================
// QUERY KEYS
// ============================================================================

/**
 * Query key factory for docs.
 * Structured keys enable fine-grained cache invalidation.
 */
export const docKeys = {
  all: ['docs'] as const,
  lists: () => [...docKeys.all, 'list'] as const,
  listByBrand: (brandId: string) => [...docKeys.lists(), brandId] as const,
  details: () => [...docKeys.all, 'detail'] as const,
  detail: (docId: string) => [...docKeys.details(), docId] as const,
  readiness: () => [...docKeys.all, 'readiness'] as const,
  readinessByBrand: (brandId: string) => [...docKeys.readiness(), brandId] as const,
};

// ============================================================================
// FETCH FUNCTIONS
// ============================================================================

/**
 * Fetch all generated docs for a brand.
 */
async function fetchBrandDocs(brandId: string): Promise<GeneratedDoc[]> {
  const supabase = createBrowserClient();

  if (!supabase) {
    log.warn('Supabase client not available');
    return [];
  }

  const { data, error } = await supabase
    .from('generated_docs')
    .select('*')
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false });

  if (error) {
    log.error('Failed to fetch docs', { error: error.message, brandId });
    throw new Error(error.message);
  }

  return (data ?? []) as GeneratedDoc[];
}

/**
 * Fetch a single generated doc by ID.
 */
async function fetchDoc(docId: string): Promise<GeneratedDoc> {
  const supabase = createBrowserClient();

  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  const { data, error } = await supabase
    .from('generated_docs')
    .select('*')
    .eq('id', docId)
    .single();

  if (error) {
    log.error('Failed to fetch doc', { error: error.message, docId });
    throw new Error(error.message);
  }

  return data as GeneratedDoc;
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch all docs for a brand.
 *
 * @param brandId - The brand UUID
 *
 * @example
 * const { data: docs, isLoading } = useBrandDocs(brandId);
 */
export function useBrandDocs(brandId: string) {
  return useQuery({
    queryKey: docKeys.listByBrand(brandId),
    queryFn: () => fetchBrandDocs(brandId),
    enabled: !!brandId,
  });
}

/**
 * Hook to fetch a single doc by ID.
 *
 * @param docId - The doc UUID
 *
 * @example
 * const { data: doc, isLoading } = useDoc(docId);
 */
export function useDoc(docId: string) {
  return useQuery({
    queryKey: docKeys.detail(docId),
    queryFn: () => fetchDoc(docId),
    enabled: !!docId,
  });
}

// ============================================================================
// READINESS HOOKS
// ============================================================================

/**
 * Hook to check doc readiness for all templates.
 * Uses analysis runs from brand data.
 *
 * @param runs - The brand's analysis runs
 *
 * @example
 * const readiness = useDocTemplatesReadiness(runs);
 * if (readiness['golden-circle'].isReady) {
 *   // Can generate Golden Circle
 * }
 */
export function useDocTemplatesReadiness(runs: AnalysisRun[]) {
  return useMemo(() => {
    const results: Record<DocTemplateId, ReadinessCheckResult> = {} as Record<DocTemplateId, ReadinessCheckResult>;

    for (const templateId of docTemplateIds) {
      results[templateId] = checkDocReadiness(runs, templateId);
    }

    return results;
  }, [runs]);
}

/**
 * Hook to check readiness for a specific template.
 *
 * @param runs - The brand's analysis runs
 * @param templateId - The template to check
 *
 * @example
 * const { isReady, missingAnalyzers } = useTemplateReadiness(runs, 'golden-circle');
 */
export function useTemplateReadiness(runs: AnalysisRun[], templateId: DocTemplateId) {
  return useMemo(() => {
    return checkDocReadiness(runs, templateId);
  }, [runs, templateId]);
}

/**
 * Get template configs with readiness status attached.
 * Useful for rendering template grid with status badges.
 *
 * @param runs - The brand's analysis runs
 *
 * @example
 * const templates = useTemplatesWithReadiness(runs);
 * templates.forEach(t => console.log(t.config.name, t.readiness.isReady));
 */
export function useTemplatesWithReadiness(runs: AnalysisRun[]) {
  const readiness = useDocTemplatesReadiness(runs);

  return useMemo(() => {
    return docTemplateConfigs.map(config => ({
      config,
      readiness: readiness[config.id],
    }));
  }, [readiness]);
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

interface GenerateDocInput {
  brandId: string;
  templateId: DocTemplateId;
}

/**
 * Hook to generate a new doc.
 * Invalidates the brand docs cache on success.
 *
 * @example
 * const generateDoc = useGenerateDoc();
 * await generateDoc.mutateAsync({ brandId, templateId: 'golden-circle' });
 */
export function useGenerateDoc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: GenerateDocInput): Promise<{ docId: string }> => {
      log.info('Generating doc', { brandId: input.brandId, templateId: input.templateId });

      const response = await fetch('/api/docs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: input.brandId,
          templateId: input.templateId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate document');
      }

      log.success('Doc generated', { docId: data.docId });
      return { docId: data.docId };
    },
    onSuccess: (_, variables) => {
      // Invalidate docs list for this brand
      queryClient.invalidateQueries({
        queryKey: docKeys.listByBrand(variables.brandId),
      });
      toast.success('Document generated!');
    },
    onError: (error) => {
      log.error('Failed to generate doc', { error: error.message });
      toast.error(error.message);
    },
  });
}

/**
 * Hook to delete a generated doc.
 * Invalidates the brand docs cache on success.
 *
 * @example
 * const deleteDoc = useDeleteDoc();
 * await deleteDoc.mutateAsync({ docId, brandId });
 */
export function useDeleteDoc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { docId: string; brandId: string }): Promise<void> => {
      const supabase = createBrowserClient();

      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      log.info('Deleting doc', { docId: input.docId });

      const { error } = await supabase
        .from('generated_docs')
        .delete()
        .eq('id', input.docId);

      if (error) {
        throw new Error(error.message);
      }

      log.success('Doc deleted', { docId: input.docId });
    },
    onSuccess: (_, variables) => {
      // Invalidate docs list
      queryClient.invalidateQueries({
        queryKey: docKeys.listByBrand(variables.brandId),
      });
      // Remove doc from cache
      queryClient.removeQueries({
        queryKey: docKeys.detail(variables.docId),
      });
      toast.success('Document deleted');
    },
    onError: (error) => {
      log.error('Failed to delete doc', { error: error.message });
      toast.error(error.message);
    },
  });
}

// ============================================================================
// PREFETCH UTILITIES
// ============================================================================

/**
 * Prefetch a doc's data for faster navigation.
 *
 * @example
 * <div onMouseEnter={() => prefetchDoc(doc.id)}>
 */
export function usePrefetchDoc() {
  const queryClient = useQueryClient();

  return (docId: string) => {
    queryClient.prefetchQuery({
      queryKey: docKeys.detail(docId),
      queryFn: () => fetchDoc(docId),
    });
  };
}
