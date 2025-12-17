/**
 * BRANDS DATABASE HELPERS
 * ========================
 * Functions for CRUD operations on the brands table.
 * These are server-side helpers for use in API routes.
 */

import { createServerClient, createAdminClient } from './server';
import { log } from '@/lib/utils/logger';
import type { Brand, ScrapeStatus } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export type CreateBrandInput = {
  userId: string;
  sourceUrl: string;
  isOwnBrand?: boolean;
};

export type UpdateBrandInput = {
  name?: string | null;
  scrapedContent?: string;
  scrapedAt?: string;
  scrapeStatus?: ScrapeStatus;
  scrapeError?: string | null;
};

// ============================================================================
// CREATE
// ============================================================================

/**
 * Create a new brand for a user.
 *
 * @param input - Brand creation data
 * @returns The created brand or error
 *
 * @example
 * const { brand, error } = await createBrand({
 *   userId: 'user-uuid',
 *   sourceUrl: 'https://example.com'
 * });
 */
export async function createBrand(input: CreateBrandInput): Promise<{
  brand: Brand | null;
  error: string | null;
}> {
  log.info('📝 Creating brand', { url: input.sourceUrl });

  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('brands')
      .insert({
        user_id: input.userId,
        source_url: input.sourceUrl,
        is_own_brand: input.isOwnBrand ?? false,
        scrape_status: 'pending',
      })
      .select()
      .single();

    if (error) {
      log.error('Failed to create brand', { error: error.message });
      return { brand: null, error: error.message };
    }

    const brand = data as Brand;
    log.success('Brand created', { brandId: brand.id });
    return { brand, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error('Exception creating brand', { error: message });
    return { brand: null, error: message };
  }
}

// ============================================================================
// READ
// ============================================================================

/**
 * Get a brand by ID (with RLS - only owner can access).
 *
 * @param brandId - The brand UUID
 * @returns Brand or error
 */
export async function getBrand(brandId: string): Promise<{
  brand: Brand | null;
  error: string | null;
}> {
  log.debug('🔍 Fetching brand', { brandId });

  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', brandId)
      .single();

    if (error) {
      log.error('Failed to fetch brand', { error: error.message, brandId });
      return { brand: null, error: error.message };
    }

    return { brand: data as Brand, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { brand: null, error: message };
  }
}

/**
 * Get all brands for the current user.
 *
 * @returns Array of brands
 */
export async function getUserBrands(): Promise<{
  brands: Brand[];
  error: string | null;
}> {
  log.debug('🔍 Fetching user brands');

  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      log.error('Failed to fetch brands', { error: error.message });
      return { brands: [], error: error.message };
    }

    log.debug('Fetched brands', { count: data.length });
    return { brands: data as Brand[], error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { brands: [], error: message };
  }
}

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Update a brand's fields.
 *
 * @param brandId - The brand UUID
 * @param input - Fields to update
 * @returns Updated brand or error
 */
export async function updateBrand(
  brandId: string,
  input: UpdateBrandInput
): Promise<{
  brand: Brand | null;
  error: string | null;
}> {
  log.info('📝 Updating brand', { brandId, fields: Object.keys(input) });

  try {
    const supabase = await createServerClient();

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.scrapedContent !== undefined) updateData.scraped_content = input.scrapedContent;
    if (input.scrapedAt !== undefined) updateData.scraped_at = input.scrapedAt;
    if (input.scrapeStatus !== undefined) updateData.scrape_status = input.scrapeStatus;
    if (input.scrapeError !== undefined) updateData.scrape_error = input.scrapeError;

    const { data, error } = await supabase
      .from('brands')
      .update(updateData)
      .eq('id', brandId)
      .select()
      .single();

    if (error) {
      log.error('Failed to update brand', { error: error.message, brandId });
      return { brand: null, error: error.message };
    }

    log.success('Brand updated', { brandId });
    return { brand: data as Brand, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { brand: null, error: message };
  }
}

/**
 * Update brand using admin client (bypasses RLS).
 * Use this in background jobs or when updating from API routes
 * without user context.
 */
export async function updateBrandAdmin(
  brandId: string,
  input: UpdateBrandInput
): Promise<{
  brand: Brand | null;
  error: string | null;
}> {
  log.info('📝 [Admin] Updating brand', { brandId, fields: Object.keys(input) });

  try {
    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.scrapedContent !== undefined) updateData.scraped_content = input.scrapedContent;
    if (input.scrapedAt !== undefined) updateData.scraped_at = input.scrapedAt;
    if (input.scrapeStatus !== undefined) updateData.scrape_status = input.scrapeStatus;
    if (input.scrapeError !== undefined) updateData.scrape_error = input.scrapeError;

    const { data, error } = await supabase
      .from('brands')
      .update(updateData)
      .eq('id', brandId)
      .select()
      .single();

    if (error) {
      log.error('[Admin] Failed to update brand', { error: error.message, brandId });
      return { brand: null, error: error.message };
    }

    log.success('[Admin] Brand updated', { brandId });
    return { brand: data as Brand, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { brand: null, error: message };
  }
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete a brand (cascades to analysis_runs).
 *
 * @param brandId - The brand UUID
 * @returns Success or error
 */
export async function deleteBrand(brandId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  log.info('🗑️ Deleting brand', { brandId });

  try {
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', brandId);

    if (error) {
      log.error('Failed to delete brand', { error: error.message, brandId });
      return { success: false, error: error.message };
    }

    log.success('Brand deleted', { brandId });
    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}
