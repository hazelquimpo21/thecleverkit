/**
 * BRAND DETAIL PAGE
 * ==================
 * Shows the brand profile with analysis results.
 * Server component that fetches initial data, then hands off to
 * client component for realtime updates.
 *
 * Architecture:
 * - Server: Initial data fetch (fast first paint, SEO)
 * - Client: Realtime subscriptions (auto-updating UI, including header status)
 */

import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { PageContainer } from '@/components/layout/page-container';
import { BrandAnalysisContent } from '@/components/brands/brand-analysis-content';
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
 * Fetches initial data and passes to client component for interactivity.
 *
 * The header is rendered inside BrandAnalysisContent so it can show
 * realtime status updates (e.g., "Analyzing" badge that disappears when done).
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

  // Determine initial display name (fallback chain: brand name → parsed name → domain)
  // This is passed to the client component, which may update it when basicsData loads
  const initialDisplayName = brand.name || basicsData?.business_name || extractDomain(brand.source_url);

  return (
    <PageContainer>
      {/* Main Content - client component with realtime updates including header */}
      <BrandAnalysisContent
        brand={brand}
        initialRuns={runs}
        initialDisplayName={initialDisplayName}
      />
    </PageContainer>
  );
}
