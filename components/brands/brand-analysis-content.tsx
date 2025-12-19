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
 * - Realtime header status updates (analyzing pill)
 * - Tabs for Overview and Docs views
 *
 * @update 2025-12-19 - Added tabs for docs feature integration
 */

'use client';

import { useState, useMemo, useRef } from 'react';
import { useBrandAnalysis, useBrandDocs } from '@/hooks';
import { extractDomain } from '@/lib/utils/format';
import { ProgressList } from '@/components/analysis/progress-list';
import { BasicsCard } from '@/components/analysis/cards/basics-card';
import { CustomerCard } from '@/components/analysis/cards/customer-card';
import { ProductsCard } from '@/components/analysis/cards/products-card';
import { DocsTabContent } from '@/components/docs';
import { BrandHeader } from './brand-header';
import { ProfileTabs, type ProfileTab } from './profile-tabs';
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
  /** Initial display name computed from server (fallback until basicsData loads) */
  initialDisplayName: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Client component for displaying brand analysis with realtime updates.
 * Includes the brand header so it can display realtime analyzing status.
 *
 * @example
 * <BrandAnalysisContent
 *   brand={brand}
 *   initialRuns={runs}
 *   initialDisplayName="Acme Corp"
 * />
 */
export function BrandAnalysisContent({
  brand,
  initialRuns,
  initialDisplayName,
}: BrandAnalysisContentProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

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
    justCompleted,
    acknowledgeCompletion,
    isRealtimeConnected,
    isPolling,
    getRunByType,
  } = useBrandAnalysis({
    brandId: brand.id,
    initialRuns,
  });

  // Hook for docs count (for tab badge)
  const { data: docs } = useBrandDocs(brand.id);
  const docsCount = docs?.filter(d => d.status === 'complete').length ?? 0;

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

  // Compute display name - updates when basicsData becomes available
  // Priority: brand.name > basicsData.business_name > initial display name > domain
  const displayName = useMemo(() => {
    return (
      brand.name ||
      basicsData?.business_name ||
      initialDisplayName ||
      extractDomain(brand.source_url)
    );
  }, [brand.name, brand.source_url, basicsData?.business_name, initialDisplayName]);

  // Check if each analyzer is loading
  const basicsLoading = basicsRun?.status === 'analyzing' || basicsRun?.status === 'parsing';
  const customerLoading = customerRun?.status === 'analyzing' || customerRun?.status === 'parsing';
  const productsLoading = productsRun?.status === 'analyzing' || productsRun?.status === 'parsing';

  return (
    <>
      {/* Brand Header with realtime analyzing status */}
      <BrandHeader
        displayName={displayName}
        sourceUrl={brand.source_url}
        createdAt={brand.created_at}
        isAnalyzing={isAnalyzing}
      />

      {/* Completion celebration toast */}
      {justCompleted && wasInitiallyAnalyzing.current && (
        <CompletionCelebration onDismiss={acknowledgeCompletion} />
      )}

      {/* Tab Navigation */}
      <ProfileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        docsCount={docsCount}
      />

      {/* Tab Content */}
      {activeTab === 'overview' ? (
        <OverviewContent
          runs={runs}
          isAnalyzing={isAnalyzing}
          isRealtimeConnected={isRealtimeConnected}
          isPolling={isPolling}
          basicsData={basicsData}
          customerData={customerData}
          productsData={productsData}
          basicsLoading={basicsLoading}
          customerLoading={customerLoading}
          productsLoading={productsLoading}
        />
      ) : (
        <DocsTabContent brandId={brand.id} runs={runs} />
      )}
    </>
  );
}

// ============================================================================
// OVERVIEW CONTENT (extracted for readability)
// ============================================================================

interface OverviewContentProps {
  runs: AnalysisRun[];
  isAnalyzing: boolean;
  isRealtimeConnected: boolean;
  isPolling: boolean;
  basicsData: ParsedBasics | null;
  customerData: ParsedCustomer | null;
  productsData: ParsedProducts | null;
  basicsLoading: boolean;
  customerLoading: boolean;
  productsLoading: boolean;
}

function OverviewContent({
  runs,
  isAnalyzing,
  isRealtimeConnected,
  isPolling,
  basicsData,
  customerData,
  productsData,
  basicsLoading,
  customerLoading,
  productsLoading,
}: OverviewContentProps) {
  return (
    <>
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

      {/* Status message at bottom */}
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
