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
 * - Integrated PageHeader with tabs (Overview, Store, Documents)
 *
 * Tabs:
 * - Overview: Brand intelligence cards
 * - Store: Template gallery with intelligent buttons + inline doc viewer
 * - Documents: Archive view of all generated docs
 *
 * @update 2025-12-19 - Updated for sidebar layout redesign with PageHeader
 * @update 2025-12-19 - Added Store tab for Template Store feature
 * @update 2025-12-19 - Store now has intelligent buttons and inline doc viewer
 */

'use client';

import { useState, useMemo, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { useBrandAnalysis, useBrandDocs } from '@/hooks';
import { extractDomain, decodeHtmlEntities, formatRelativeTime } from '@/lib/utils/format';
import { ProgressList } from '@/components/analysis/progress-list';
import { BasicsCard } from '@/components/analysis/cards/basics-card';
import { CustomerCard } from '@/components/analysis/cards/customer-card';
import { ProductsCard } from '@/components/analysis/cards/products-card';
import { DocsTabContent } from '@/components/docs';
import { StoreTabContent } from '@/components/store';
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

type ProfileTab = 'overview' | 'store' | 'docs';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Client component for displaying brand analysis with realtime updates.
 * Uses PageHeader with integrated tabs for navigation.
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

  // Build subtitle with URL and timing
  const subtitle = `${extractDomain(brand.source_url)} • Added ${formatRelativeTime(brand.created_at)}`;

  // Tab configuration
  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'store', label: 'Store' },
    { value: 'docs', label: 'Documents', badge: docsCount > 0 ? docsCount : undefined },
  ];

  return (
    <>
      {/* Page Header with back link and tabs */}
      <PageHeader
        backLink={{ href: '/dashboard', label: 'Back to Dashboard' }}
        title={decodeHtmlEntities(displayName)}
        subtitle={subtitle}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as ProfileTab)}
        actions={
          isAnalyzing ? (
            <Badge variant="warning" className="animate-pulse-soft">
              <RefreshCw className="h-3 w-3 animate-spin mr-1.5" />
              Analyzing...
            </Badge>
          ) : null
        }
      />

      {/* Completion celebration toast */}
      {justCompleted && wasInitiallyAnalyzing.current && (
        <CompletionCelebration onDismiss={acknowledgeCompletion} />
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
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
      )}
      {activeTab === 'store' && (
        <StoreTabContent brandId={brand.id} brand={brand} runs={runs} />
      )}
      {activeTab === 'docs' && (
        <DocsTabContent brandId={brand.id} runs={runs} />
      )}
    </>
  );
}

// ============================================================================
// OVERVIEW CONTENT
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
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
          <BasicsCard data={basicsData} isLoading={basicsLoading} />
          <CustomerCard data={customerData} isLoading={customerLoading} />
          <ProductsCard data={productsData} isLoading={productsLoading} />
        </div>
      </div>

      {/* Status message at bottom */}
      {isAnalyzing && (
        <div className="mt-8 text-center">
          <p className="text-sm text-foreground-muted">
            Analysis in progress. Results will appear automatically.
          </p>
        </div>
      )}
    </>
  );
}
