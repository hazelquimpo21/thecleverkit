/**
 * BRAND DETAIL PAGE
 * ==================
 * Shows the brand profile with analysis results.
 * Server component that fetches initial data, then hands off to
 * client component for realtime updates.
 *
 * Architecture:
 * - Server: Initial data fetch (fast first paint, SEO)
 * - Client: Realtime subscriptions (auto-updating UI)
 */

import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { PageContainer } from '@/components/layout/page-container';
import { BrandAnalysisContent } from '@/components/brands/brand-analysis-content';
import { BrandHeader } from '@/components/brands/brand-header';
import { extractDomain } from '@/lib/utils/format';
import type { AnalysisRun, Brand } from '@/types';
import type { ParsedBasics } from '@/types/analyzers';

// ============================================================================
// TYPES
// ============================================================================

interface BrandPageProps {
  params: Promise<{
    brandId: string;
  }>;
}

// ============================================================================
// DATA FETCHING
// ============================================================================

/**
 * Fetch brand and analysis runs from Supabase.
 * This runs on the server for fast initial page load.
 */
async function getBrandWithAnalyses(brandId: string): Promise<{
  brand: Brand | null;
  runs: AnalysisRun[];
}> {
  const supabase = await createServerClient();

  // Return empty if Supabase is not configured
  if (!supabase) {
    return { brand: null, runs: [] };
  }

  // Fetch brand
  const { data: brandData, error: brandError } = await supabase
    .from('brands')
    .select('*')
    .eq('id', brandId)
    .single();

  if (brandError || !brandData) {
    return { brand: null, runs: [] };
  }

  // Fetch analysis runs
  const { data: runsData } = await supabase
    .from('analysis_runs')
    .select('*')
    .eq('brand_id', brandId)
    .order('created_at', { ascending: true });

  return {
    brand: brandData as Brand,
    runs: (runsData || []) as AnalysisRun[],
  };
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

/**
 * Brand detail page - server component that orchestrates layout.
 * Fetches initial data and passes to client components for interactivity.
 */
export default async function BrandPage({ params }: BrandPageProps) {
  const { brandId } = await params;
  const { brand, runs } = await getBrandWithAnalyses(brandId);

  if (!brand) {
    notFound();
  }

  // Extract initial parsed data to determine display name
  const basicsRun = runs.find(r => r.analyzer_type === 'basics');
  const basicsData = basicsRun?.parsed_data as ParsedBasics | null;

  // Determine display name (fallback chain: brand name → parsed name → domain)
  const displayName = brand.name || basicsData?.business_name || extractDomain(brand.source_url);

  // Check if any analyzers are still running (for initial badge)
  const isAnalyzing = runs.some(r =>
    r.status === 'analyzing' || r.status === 'parsing' || r.status === 'queued'
  );

  return (
    <PageContainer>
      {/* Header - shows brand name, URL, status */}
      <BrandHeader
        displayName={displayName}
        sourceUrl={brand.source_url}
        createdAt={brand.created_at}
        isAnalyzing={isAnalyzing}
      />

      {/* Main Content - client component with realtime updates */}
      <BrandAnalysisContent
        brand={brand}
        initialRuns={runs}
      />
    </PageContainer>
  );
}
