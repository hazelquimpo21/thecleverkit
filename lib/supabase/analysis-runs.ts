/**
 * ANALYSIS RUNS DATABASE HELPERS
 * ===============================
 * Functions for CRUD operations on the analysis_runs table.
 * Each analysis run represents one analyzer execution for one brand.
 */

import { createServerClient, createAdminClient } from './server';
import { log, analyzerLog } from '@/lib/utils/logger';
import type { AnalysisRun, AnalyzerType, AnalysisStatus } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export type CreateAnalysisRunInput = {
  brandId: string;
  analyzerType: AnalyzerType;
};

export type UpdateAnalysisRunInput = {
  status?: AnalysisStatus;
  rawAnalysis?: string;
  parsedData?: Record<string, unknown>;
  errorMessage?: string | null;
  startedAt?: string;
  completedAt?: string;
};

// ============================================================================
// CREATE
// ============================================================================

/**
 * Create analysis run records for a brand.
 * Creates one run for each analyzer type (or specified types).
 *
 * @param brandId - The brand UUID
 * @param analyzerTypes - Which analyzers to create runs for
 * @returns Created runs or error
 */
export async function createAnalysisRuns(
  brandId: string,
  analyzerTypes: AnalyzerType[] = ['basics', 'customer', 'products']
): Promise<{
  runs: AnalysisRun[];
  error: string | null;
}> {
  log.info('📝 Creating analysis runs', { brandId, analyzers: analyzerTypes });

  try {
    const supabase = createAdminClient();

    const runData = analyzerTypes.map(analyzerType => ({
      brand_id: brandId,
      analyzer_type: analyzerType,
      status: 'queued' as AnalysisStatus,
    }));

    const { data, error } = await supabase
      .from('analysis_runs')
      .upsert(runData, {
        onConflict: 'brand_id,analyzer_type',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      log.error('Failed to create analysis runs', { error: error.message, brandId });
      return { runs: [], error: error.message };
    }

    log.success('Analysis runs created', { count: data.length, brandId });
    return { runs: data as AnalysisRun[], error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log.error('Exception creating analysis runs', { error: message });
    return { runs: [], error: message };
  }
}

// ============================================================================
// READ
// ============================================================================

/**
 * Get all analysis runs for a brand.
 *
 * @param brandId - The brand UUID
 * @returns Array of analysis runs
 */
export async function getAnalysisRuns(brandId: string): Promise<{
  runs: AnalysisRun[];
  error: string | null;
}> {
  log.debug('🔍 Fetching analysis runs', { brandId });

  try {
    const supabase = await createServerClient();

    if (!supabase) {
      return { runs: [], error: 'Supabase not configured' };
    }

    const { data, error } = await supabase
      .from('analysis_runs')
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: true });

    if (error) {
      log.error('Failed to fetch analysis runs', { error: error.message, brandId });
      return { runs: [], error: error.message };
    }

    return { runs: data as AnalysisRun[], error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { runs: [], error: message };
  }
}

/**
 * Get a specific analysis run.
 *
 * @param brandId - The brand UUID
 * @param analyzerType - Which analyzer
 * @returns The analysis run or null
 */
export async function getAnalysisRun(
  brandId: string,
  analyzerType: AnalyzerType
): Promise<{
  run: AnalysisRun | null;
  error: string | null;
}> {
  log.debug('🔍 Fetching analysis run', { brandId, analyzerType });

  try {
    const supabase = await createServerClient();

    if (!supabase) {
      return { run: null, error: 'Supabase not configured' };
    }

    const { data, error } = await supabase
      .from('analysis_runs')
      .select('*')
      .eq('brand_id', brandId)
      .eq('analyzer_type', analyzerType)
      .single();

    if (error) {
      return { run: null, error: error.message };
    }

    return { run: data as AnalysisRun, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { run: null, error: message };
  }
}

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Update an analysis run's status and data.
 * Uses admin client to bypass RLS (for background processing).
 *
 * @param runId - The analysis run UUID
 * @param input - Fields to update
 * @returns Updated run or error
 */
export async function updateAnalysisRun(
  runId: string,
  input: UpdateAnalysisRunInput
): Promise<{
  run: AnalysisRun | null;
  error: string | null;
}> {
  log.debug('📝 Updating analysis run', { runId, status: input.status });

  try {
    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = {};
    if (input.status !== undefined) updateData.status = input.status;
    if (input.rawAnalysis !== undefined) updateData.raw_analysis = input.rawAnalysis;
    if (input.parsedData !== undefined) updateData.parsed_data = input.parsedData;
    if (input.errorMessage !== undefined) updateData.error_message = input.errorMessage;
    if (input.startedAt !== undefined) updateData.started_at = input.startedAt;
    if (input.completedAt !== undefined) updateData.completed_at = input.completedAt;

    const { data, error } = await supabase
      .from('analysis_runs')
      .update(updateData)
      .eq('id', runId)
      .select()
      .single();

    if (error) {
      log.error('Failed to update analysis run', { error: error.message, runId });
      return { run: null, error: error.message };
    }

    return { run: data as AnalysisRun, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { run: null, error: message };
  }
}

/**
 * Update analysis run by brand ID and analyzer type.
 * Useful when you don't have the run ID handy.
 */
export async function updateAnalysisRunByType(
  brandId: string,
  analyzerType: AnalyzerType,
  input: UpdateAnalysisRunInput
): Promise<{
  run: AnalysisRun | null;
  error: string | null;
}> {
  analyzerLog.start(analyzerType, brandId);

  try {
    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = {};
    if (input.status !== undefined) updateData.status = input.status;
    if (input.rawAnalysis !== undefined) updateData.raw_analysis = input.rawAnalysis;
    if (input.parsedData !== undefined) updateData.parsed_data = input.parsedData;
    if (input.errorMessage !== undefined) updateData.error_message = input.errorMessage;
    if (input.startedAt !== undefined) updateData.started_at = input.startedAt;
    if (input.completedAt !== undefined) updateData.completed_at = input.completedAt;

    const { data, error } = await supabase
      .from('analysis_runs')
      .update(updateData)
      .eq('brand_id', brandId)
      .eq('analyzer_type', analyzerType)
      .select()
      .single();

    if (error) {
      analyzerLog.error(analyzerType, error.message);
      return { run: null, error: error.message };
    }

    return { run: data as AnalysisRun, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    analyzerLog.error(analyzerType, message);
    return { run: null, error: message };
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Check if all analysis runs for a brand are complete.
 *
 * @param brandId - The brand UUID
 * @returns True if all complete, false otherwise
 */
export async function areAllRunsComplete(brandId: string): Promise<boolean> {
  const { runs, error } = await getAnalysisRuns(brandId);

  if (error || runs.length === 0) {
    return false;
  }

  return runs.every(run => run.status === 'complete');
}

/**
 * Get the overall analysis status for a brand.
 * Returns 'analyzing' if any are in progress, 'complete' if all done, etc.
 */
export async function getBrandAnalysisStatus(brandId: string): Promise<{
  status: 'queued' | 'analyzing' | 'complete' | 'error' | 'partial';
  totalRuns: number;
  completedRuns: number;
  errorRuns: number;
}> {
  const { runs, error } = await getAnalysisRuns(brandId);

  if (error || runs.length === 0) {
    return { status: 'queued', totalRuns: 0, completedRuns: 0, errorRuns: 0 };
  }

  const totalRuns = runs.length;
  const completedRuns = runs.filter(r => r.status === 'complete').length;
  const errorRuns = runs.filter(r => r.status === 'error').length;
  const inProgressRuns = runs.filter(r =>
    r.status === 'analyzing' || r.status === 'parsing'
  ).length;

  let status: 'queued' | 'analyzing' | 'complete' | 'error' | 'partial';

  if (completedRuns === totalRuns) {
    status = 'complete';
  } else if (errorRuns === totalRuns) {
    status = 'error';
  } else if (inProgressRuns > 0) {
    status = 'analyzing';
  } else if (completedRuns > 0 && errorRuns > 0) {
    status = 'partial';
  } else {
    status = 'queued';
  }

  return { status, totalRuns, completedRuns, errorRuns };
}
