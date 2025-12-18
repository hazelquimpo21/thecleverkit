/**
 * BRAND ANALYSIS CONTENT COMPONENT
 * ==================================
 * Client component that displays brand analysis with realtime updates.
 * Receives initial data from server, then subscribes to live changes.
 *
 * Features:
 * - Realtime analysis progress updates
 * - Auto-updating analyzer cards
 * - Completion celebration animation
 * - Connection status indicator
 */

'use client';

import { useEffect, useRef } from 'react';
import { useBrandAnalysis } from '@/hooks';
import { ProgressList } from '@/components/analysis/progress-list';
import { BasicsCard } from '@/components/analysis/cards/basics-card';
import { CustomerCard } from '@/components/analysis/cards/customer-card';
import { ProductsCard } from '@/components/analysis/cards/products-card';
import { CompletionCelebration } from './completion-celebration';
import { ConnectionStatus } from './connection-status';
import type { AnalysisRun, Brand } from '@/types';
import type { ParsedBasics, ParsedCustomer, ParsedProducts } from '@/types/analyzers';

// ============================================================================
// TYPES
// ============================================================================

interface BrandAnalysisContentProps {
  /** The brand being analyzed */
  brand: Brand;
  /** Initial analysis runs from server */
  initialRuns: AnalysisRun[];
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Client component for displaying brand analysis with realtime updates.
 *
 * @example
 * <BrandAnalysisContent brand={brand} initialRuns={runs} />
 */
export function BrandAnalysisContent({
  brand,
  initialRuns,
}: BrandAnalysisContentProps) {
  // Track if we had initial runs that were analyzing
  const wasInitiallyAnalyzing = useRef(
    initialRuns.some((r) =>
      r.status === 'queued' || r.status === 'analyzing' || r.status === 'parsing'
    )
  );

  // Hook for realtime analysis updates
  const {
    runs,
    isAnalyzing,
    isComplete,
    justCompleted,
    acknowledgeCompletion,
    isRealtimeConnected,
    isPolling,
    getRunByType,
  } = useBrandAnalysis({
    brandId: brand.id,
    initialRuns,
  });

  // Extract runs for each analyzer type
  const basicsRun = getRunByType('basics');
  const customerRun = getRunByType('customer');
  const productsRun = getRunByType('products');

  // Get parsed data from runs
  const basicsData = basicsRun?.status === 'complete'
    ? (basicsRun.parsed_data as ParsedBasics | null)
    : null;
  const customerData = customerRun?.status === 'complete'
    ? (customerRun.parsed_data as ParsedCustomer | null)
    : null;
  const productsData = productsRun?.status === 'complete'
    ? (productsRun.parsed_data as ParsedProducts | null)
    : null;

  // Check if each analyzer is loading
  const basicsLoading = basicsRun?.status === 'analyzing' || basicsRun?.status === 'parsing';
  const customerLoading = customerRun?.status === 'analyzing' || customerRun?.status === 'parsing';
  const productsLoading = productsRun?.status === 'analyzing' || productsRun?.status === 'parsing';

  return (
    <>
      {/* Completion celebration toast */}
      {justCompleted && wasInitiallyAnalyzing.current && (
        <CompletionCelebration onDismiss={acknowledgeCompletion} />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Progress & Status */}
        <div className="lg:col-span-1 space-y-6">
          <ProgressList runs={runs} />

          {/* Connection status indicator (only show during analysis) */}
          {isAnalyzing && (
            <ConnectionStatus
              isConnected={isRealtimeConnected}
              isPolling={isPolling}
            />
          )}
        </div>

        {/* Right Column - Analysis Results */}
        <div className="lg:col-span-2 space-y-6">
          <BasicsCard
            data={basicsData}
            isLoading={basicsLoading}
          />
          <CustomerCard
            data={customerData}
            isLoading={customerLoading}
          />
          <ProductsCard
            data={productsData}
            isLoading={productsLoading}
          />
        </div>
      </div>

      {/* Status message at bottom (no longer needed - auto updates) */}
      {isAnalyzing && (
        <div className="mt-8 text-center">
          <p className="text-sm text-stone-500">
            Analysis in progress. Results will appear automatically.
          </p>
        </div>
      )}
    </>
  );
}
