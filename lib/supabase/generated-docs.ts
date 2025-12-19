/**
 * GENERATED DOCS DATABASE HELPERS
 * =================================
 * Functions for CRUD operations on the generated_docs table.
 * Each doc is a snapshot created from brand analysis data.
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

import { createServerClient, createAdminClient } from './server';
import { log } from '@/lib/utils/logger';
import type { GeneratedDoc, GeneratedDocInsert, GeneratedDocUpdate, DocTemplateId } from '@/types';

// ============================================================================
// CREATE
// ============================================================================

/**
 * Create a new generated doc record.
 * Uses admin client to bypass RLS (for background processing).
 *
 * @param input - Doc data to insert
 * @returns Created doc or error
 *
 * @example
 * const { doc, error } = await createGeneratedDoc({
 *   brand_id: 'uuid',
 *   template_id: 'golden-circle',
 *   title: 'Golden Circle: Acme Corp',
 *   source_data: brandData,
 * });
 */
export async function createGeneratedDoc(
  input: GeneratedDocInsert
): Promise<{
  doc: GeneratedDoc | null;
  error: string | null;
}> {
  log.info('📄 Creating generated doc', {
    brandId: input.brand_id,
    templateId: input.template_id,
  });

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('generated_docs')
      .insert({
        brand_id: input.brand_id,
        template_id: input.template_id,
        title: input.title,
        content: input.content || {},
        content_markdown: input.content_markdown || null,
        source_data: input.source_data,
        status: input.status || 'generating',
        error_message: input.error_message || null,
      })
      .select()
      .single();

    if (error) {
      log.error('Failed to create generated doc', { error: error.message });
      return { doc: null, error: error.message };
    }

    log.success('Generated doc created', { docId: data.id });
    return { doc: data as GeneratedDoc, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error('Exception creating generated doc', { error: message });
    return { doc: null, error: message };
  }
}

// ============================================================================
// READ
// ============================================================================

/**
 * Get all generated docs for a brand.
 * Uses server client (respects RLS).
 *
 * @param brandId - The brand UUID
 * @returns Array of generated docs
 */
export async function getGeneratedDocs(brandId: string): Promise<{
  docs: GeneratedDoc[];
  error: string | null;
}> {
  log.debug('🔍 Fetching generated docs', { brandId });

  try {
    const supabase = await createServerClient();

    if (!supabase) {
      return { docs: [], error: 'Supabase not configured' };
    }

    const { data, error } = await supabase
      .from('generated_docs')
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });

    if (error) {
      log.error('Failed to fetch generated docs', { error: error.message, brandId });
      return { docs: [], error: error.message };
    }

    return { docs: (data ?? []) as GeneratedDoc[], error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { docs: [], error: message };
  }
}

/**
 * Get a specific generated doc by ID.
 * Uses server client (respects RLS).
 *
 * @param docId - The doc UUID
 * @returns The generated doc or null
 */
export async function getGeneratedDoc(docId: string): Promise<{
  doc: GeneratedDoc | null;
  error: string | null;
}> {
  log.debug('🔍 Fetching generated doc', { docId });

  try {
    const supabase = await createServerClient();

    if (!supabase) {
      return { doc: null, error: 'Supabase not configured' };
    }

    const { data, error } = await supabase
      .from('generated_docs')
      .select('*')
      .eq('id', docId)
      .single();

    if (error) {
      log.error('Failed to fetch generated doc', { error: error.message, docId });
      return { doc: null, error: error.message };
    }

    return { doc: data as GeneratedDoc, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { doc: null, error: message };
  }
}

/**
 * Get docs by brand and template ID.
 * Useful for checking if a template has already been generated.
 *
 * @param brandId - The brand UUID
 * @param templateId - The template ID
 * @returns Array of matching docs
 */
export async function getDocsByTemplate(
  brandId: string,
  templateId: DocTemplateId
): Promise<{
  docs: GeneratedDoc[];
  error: string | null;
}> {
  log.debug('🔍 Fetching docs by template', { brandId, templateId });

  try {
    const supabase = await createServerClient();

    if (!supabase) {
      return { docs: [], error: 'Supabase not configured' };
    }

    const { data, error } = await supabase
      .from('generated_docs')
      .select('*')
      .eq('brand_id', brandId)
      .eq('template_id', templateId)
      .order('created_at', { ascending: false });

    if (error) {
      log.error('Failed to fetch docs by template', { error: error.message });
      return { docs: [], error: error.message };
    }

    return { docs: (data ?? []) as GeneratedDoc[], error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { docs: [], error: message };
  }
}

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Update a generated doc's content and status.
 * Uses admin client to bypass RLS (for background processing).
 *
 * @param docId - The doc UUID
 * @param input - Fields to update
 * @returns Updated doc or error
 */
export async function updateGeneratedDoc(
  docId: string,
  input: GeneratedDocUpdate
): Promise<{
  doc: GeneratedDoc | null;
  error: string | null;
}> {
  log.debug('📝 Updating generated doc', { docId, status: input.status });

  try {
    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.content_markdown !== undefined) updateData.content_markdown = input.content_markdown;
    if (input.source_data !== undefined) updateData.source_data = input.source_data;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.error_message !== undefined) updateData.error_message = input.error_message;

    const { data, error } = await supabase
      .from('generated_docs')
      .update(updateData)
      .eq('id', docId)
      .select()
      .single();

    if (error) {
      log.error('Failed to update generated doc', { error: error.message, docId });
      return { doc: null, error: error.message };
    }

    log.debug('Generated doc updated', { docId, status: input.status });
    return { doc: data as GeneratedDoc, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { doc: null, error: message };
  }
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete a generated doc.
 * Uses admin client to bypass RLS.
 *
 * @param docId - The doc UUID to delete
 * @returns Success status
 */
export async function deleteGeneratedDoc(docId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  log.info('🗑️ Deleting generated doc', { docId });

  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('generated_docs')
      .delete()
      .eq('id', docId);

    if (error) {
      log.error('Failed to delete generated doc', { error: error.message, docId });
      return { success: false, error: error.message };
    }

    log.success('Generated doc deleted', { docId });
    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get the count of docs for a brand.
 *
 * @param brandId - The brand UUID
 * @returns Count of generated docs
 */
export async function getDocsCount(brandId: string): Promise<number> {
  try {
    const supabase = await createServerClient();

    if (!supabase) {
      return 0;
    }

    const { count, error } = await supabase
      .from('generated_docs')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', brandId);

    if (error) {
      log.error('Failed to count docs', { error: error.message });
      return 0;
    }

    return count ?? 0;
  } catch {
    return 0;
  }
}
