/**
 * BRAND ANALYSIS HOOK
 * ====================
 * Client-side state management for brand analysis with realtime updates.
 * Combines initial server data with live Supabase subscriptions.
 *
 * Features:
 * - Accepts initial data from server component
 * - Subscribes to realtime updates automatically
 * - Provides computed states (isAnalyzing, isComplete, hasErrors)
 * - Tracks completion status for UX feedback
 *
 * Usage:
 *   const { runs, isAnalyzing, isComplete } = useBrandAnalysis({
 *     brandId,
 *     initialRuns,
 *   });
 */

'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRealtimeAnalysis } from './use-realtime-analysis';
import { log } from '@/lib/utils/logger';
import type { AnalysisRun, AnalyzerType } from '@/types';
import type { ParsedBasics, ParsedCustomer, ParsedProducts } from '@/types/analyzers';

// ============================================================================
// TYPES
// ============================================================================

interface UseBrandAnalysisOptions {
  /** The brand ID to monitor */
  brandId: string;
  /** Initial analysis runs from server */
  initialRuns: AnalysisRun[];
  /** Callback when all analysis completes */
  onComplete?: () => void;
}

/** Union type for all parsed analyzer data */
type ParsedData = ParsedBasics | ParsedCustomer | ParsedProducts;

interface UseBrandAnalysisReturn {
  /** Current analysis runs */
  runs: AnalysisRun[];
  /** Whether any analyzer is still running */
  isAnalyzing: boolean;
  /** Whether all analyzers have completed successfully */
  isComplete: boolean;
  /** Whether any analyzer has errors */
  hasErrors: boolean;
  /** Number of completed analyzers */
  completedCount: number;
  /** Total number of analyzers */
  totalCount: number;
  /** Get run by analyzer type */
  getRunByType: (type: AnalyzerType) => AnalysisRun | undefined;
  /** Get parsed data by analyzer type (cast result to specific type) */
  getParsedData: (type: AnalyzerType) => ParsedData | null;
  /** Whether realtime is connected */
  isRealtimeConnected: boolean;
  /** Whether using fallback polling */
  isPolling: boolean;
  /** Manually refresh data */
  refresh: () => Promise<void>;
  /** Whether analysis just completed (for celebration UX) */
  justCompleted: boolean;
  /** Reset justCompleted flag */
  acknowledgeCompletion: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COMPLETION_CELEBRATION_DURATION = 5000; // 5 seconds

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if an analyzer is in a "running" state
 */
function isRunning(status: AnalysisRun['status']): boolean {
  return status === 'queued' || status === 'analyzing' || status === 'parsing';
}

/**
 * Check if all runs are complete (no errors)
 */
function checkAllComplete(runs: AnalysisRun[]): boolean {
  return runs.length > 0 && runs.every((r) => r.status === 'complete');
}

/**
 * Check if any runs have errors
 */
function checkHasErrors(runs: AnalysisRun[]): boolean {
  return runs.some((r) => r.status === 'error');
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for managing brand analysis state with realtime updates.
 *
 * @param options - Configuration options
 * @returns Analysis state and control functions
 *
 * @example
 * function BrandProfile({ brandId, initialRuns }) {
 *   const {
 *     runs,
 *     isAnalyzing,
 *     isComplete,
 *     justCompleted,
 *     acknowledgeCompletion,
 *   } = useBrandAnalysis({ brandId, initialRuns });
 *
 *   return (
 *     <>
 *       {justCompleted && <CelebrationToast />}
 *       <ProgressList runs={runs} />
 *     </>
 *   );
 * }
 */
export function useBrandAnalysis(
  options: UseBrandAnalysisOptions
): UseBrandAnalysisReturn {
  const { brandId, initialRuns, onComplete } = options;

  // Core state
  const [runs, setRuns] = useState<AnalysisRun[]>(initialRuns);
  const [justCompleted, setJustCompleted] = useState(false);

  // Track if we've already fired completion
  const hasCompletedRef = useRef(checkAllComplete(initialRuns));
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Handle realtime updates
   */
  const handleUpdate = useCallback(
    (newRuns: AnalysisRun[]) => {
      log.debug('Analysis runs updated', {
        count: newRuns.length,
        statuses: newRuns.map((r) => `${r.analyzer_type}: ${r.status}`).join(', '),
      });

      setRuns(newRuns);

      // Check for completion transition
      const wasComplete = hasCompletedRef.current;
      const nowComplete = checkAllComplete(newRuns);

      if (!wasComplete && nowComplete) {
        log.success('All analyzers completed!');
        hasCompletedRef.current = true;
        setJustCompleted(true);

        // Call completion callback
        onComplete?.();

        // Auto-reset justCompleted after duration
        completionTimeoutRef.current = setTimeout(() => {
          setJustCompleted(false);
        }, COMPLETION_CELEBRATION_DURATION);
      }
    },
    [onComplete]
  );

  /**
   * Acknowledge completion (dismiss celebration)
   */
  const acknowledgeCompletion = useCallback(() => {
    setJustCompleted(false);
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }
  }, []);

  // Set up realtime subscription
  const { isConnected, isPolling, refresh } = useRealtimeAnalysis(brandId, {
    onUpdate: handleUpdate,
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  // Computed values
  const isAnalyzing = useMemo(() => runs.some((r) => isRunning(r.status)), [runs]);

  const isComplete = useMemo(() => checkAllComplete(runs), [runs]);

  const hasErrors = useMemo(() => checkHasErrors(runs), [runs]);

  const completedCount = useMemo(
    () => runs.filter((r) => r.status === 'complete').length,
    [runs]
  );

  const totalCount = runs.length;

  /**
   * Get a specific run by analyzer type
   */
  const getRunByType = useCallback(
    (type: AnalyzerType): AnalysisRun | undefined => {
      return runs.find((r) => r.analyzer_type === type);
    },
    [runs]
  );

  /**
   * Get parsed data for a specific analyzer.
   * Caller should cast to the appropriate type (ParsedBasics, etc.)
   */
  const getParsedData = useCallback(
    (type: AnalyzerType): ParsedData | null => {
      const run = runs.find((r) => r.analyzer_type === type);
      if (!run || run.status !== 'complete' || !run.parsed_data) {
        return null;
      }
      return run.parsed_data as ParsedData;
    },
    [runs]
  );

  return {
    runs,
    isAnalyzing,
    isComplete,
    hasErrors,
    completedCount,
    totalCount,
    getRunByType,
    getParsedData,
    isRealtimeConnected: isConnected,
    isPolling,
    refresh,
    justCompleted,
    acknowledgeCompletion,
  };
}
