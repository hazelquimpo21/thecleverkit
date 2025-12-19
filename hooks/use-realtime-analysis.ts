/**
 * REALTIME ANALYSIS HOOK
 * =======================
 * Subscribes to Supabase realtime updates for analysis_runs.
 * Automatically updates UI when analyzer status changes.
 *
 * Features:
 * - Realtime subscription to analysis_runs table
 * - Fallback polling for connection issues
 * - Connection status tracking
 * - Automatic cleanup on unmount
 *
 * Usage:
 *   const { isConnected } = useRealtimeAnalysis(brandId, onUpdate);
 */

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { log } from '@/lib/utils/logger';
import type { AnalysisRun } from '@/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

interface UseRealtimeAnalysisOptions {
  /** Callback when analysis runs are updated */
  onUpdate: (runs: AnalysisRun[]) => void;
  /** Enable fallback polling (default: true) */
  enablePolling?: boolean;
  /** Polling interval in ms (default: 3000) */
  pollingInterval?: number;
}

interface UseRealtimeAnalysisReturn {
  /** Whether realtime connection is active */
  isConnected: boolean;
  /** Whether currently using fallback polling */
  isPolling: boolean;
  /** Manually trigger a refresh */
  refresh: () => Promise<void>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_POLLING_INTERVAL = 3000;
const RECONNECT_DELAY = 1000;
const MAX_RECONNECT_ATTEMPTS = 5;

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook that subscribes to realtime updates for a brand's analysis runs.
 *
 * @param brandId - The brand ID to watch
 * @param options - Configuration options
 * @returns Connection status and control functions
 *
 * @example
 * function BrandProfile({ brandId }) {
 *   const [runs, setRuns] = useState(initialRuns);
 *
 *   const { isConnected } = useRealtimeAnalysis(brandId, {
 *     onUpdate: (newRuns) => setRuns(newRuns),
 *   });
 *
 *   return <ProgressList runs={runs} />;
 * }
 */
export function useRealtimeAnalysis(
  brandId: string,
  options: UseRealtimeAnalysisOptions
): UseRealtimeAnalysisReturn {
  const {
    onUpdate,
    enablePolling = true,
    pollingInterval = DEFAULT_POLLING_INTERVAL,
  } = options;

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  // Refs for cleanup and state management
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);

  // Create supabase client
  const supabase = createBrowserClient();

  /**
   * Fetch current analysis runs from the database
   */
  const fetchRuns = useCallback(async (): Promise<AnalysisRun[]> => {
    if (!supabase) {
      log.warn('Supabase client not available for fetching runs');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('analysis_runs')
        .select('*')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: true });

      if (error) {
        log.error('Failed to fetch analysis runs', { error: error.message });
        return [];
      }

      return (data || []) as AnalysisRun[];
    } catch (err) {
      log.error('Unexpected error fetching analysis runs', {
        error: err instanceof Error ? err.message : 'Unknown error',
      });
      return [];
    }
  }, [brandId, supabase]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    const runs = await fetchRuns();
    if (isMountedRef.current && runs.length > 0) {
      onUpdate(runs);
    }
  }, [fetchRuns, onUpdate]);

  /**
   * Start fallback polling
   */
  const startPolling = useCallback(() => {
    if (pollingRef.current || !enablePolling) return;

    log.debug('Starting fallback polling', { interval: pollingInterval });
    setIsPolling(true);

    pollingRef.current = setInterval(async () => {
      if (!isMountedRef.current) return;

      const runs = await fetchRuns();
      if (runs.length > 0) {
        onUpdate(runs);
      }
    }, pollingInterval);
  }, [enablePolling, pollingInterval, fetchRuns, onUpdate]);

  /**
   * Stop fallback polling
   */
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      log.debug('Stopping fallback polling');
      clearInterval(pollingRef.current);
      pollingRef.current = null;
      setIsPolling(false);
    }
  }, []);

  /**
   * Set up realtime subscription
   */
  useEffect(() => {
    isMountedRef.current = true;

    // Skip if no supabase client
    if (!supabase) {
      log.warn('Supabase client not available, using polling only');
      startPolling();
      return;
    }

    log.debug('Setting up realtime subscription', { brandId });

    // Create channel for this brand's analysis runs
    const channel = supabase
      .channel(`analysis-runs-${brandId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'analysis_runs',
          filter: `brand_id=eq.${brandId}`,
        },
        async (payload) => {
          if (!isMountedRef.current) return;

          log.debug('Realtime update received', {
            event: payload.eventType,
            analyzerType: (payload.new as AnalysisRun)?.analyzer_type,
            status: (payload.new as AnalysisRun)?.status,
          });

          // Fetch all runs to ensure consistent state
          const runs = await fetchRuns();
          if (runs.length > 0 && isMountedRef.current) {
            onUpdate(runs);
          }
        }
      )
      .subscribe((status) => {
        if (!isMountedRef.current) return;

        log.debug('Realtime subscription status', { status });

        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          stopPolling();
          reconnectAttemptsRef.current = 0;
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);

          // Attempt reconnection with backoff
          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current += 1;
            const delay = RECONNECT_DELAY * reconnectAttemptsRef.current;
            log.debug('Scheduling reconnection', {
              attempt: reconnectAttemptsRef.current,
              delay,
            });

            setTimeout(() => {
              if (isMountedRef.current && channelRef.current) {
                channelRef.current.subscribe();
              }
            }, delay);
          } else {
            // Fall back to polling after max reconnect attempts
            log.warn('Max reconnect attempts reached, falling back to polling');
            startPolling();
          }
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;

      log.debug('Cleaning up realtime subscription', { brandId });

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      stopPolling();
    };
  }, [brandId, supabase, fetchRuns, onUpdate, startPolling, stopPolling]);

  return {
    isConnected,
    isPolling,
    refresh,
  };
}
