/**
 * BRAND DETAIL PAGE
 * ==================
 * Shows the brand profile with analysis results.
 * Updates in real-time as analyzers complete.
 */

import { notFound } from 'next/navigation';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressList } from '@/components/analysis/progress-list';
import { BasicsCard } from '@/components/analysis/cards/basics-card';
import { CustomerCard } from '@/components/analysis/cards/customer-card';
import { ProductsCard } from '@/components/analysis/cards/products-card';
import { extractDomain, formatRelativeTime } from '@/lib/utils/format';
import type { AnalysisRun, Brand } from '@/types';
import type { ParsedBasics, ParsedCustomer, ParsedProducts } from '@/types/analyzers';

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

async function getBrandWithAnalyses(brandId: string): Promise<{
  brand: Brand | null;
  runs: AnalysisRun[];
}> {
  const supabase = await createServerClient();

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

export default async function BrandPage({ params }: BrandPageProps) {
  const { brandId } = await params;
  const { brand, runs } = await getBrandWithAnalyses(brandId);

  if (!brand) {
    notFound();
  }

  // Extract parsed data from runs
  const basicsRun = runs.find(r => r.analyzer_type === 'basics');
  const customerRun = runs.find(r => r.analyzer_type === 'customer');
  const productsRun = runs.find(r => r.analyzer_type === 'products');

  const basicsData = basicsRun?.parsed_data as ParsedBasics | null;
  const customerData = customerRun?.parsed_data as ParsedCustomer | null;
  const productsData = productsRun?.parsed_data as ParsedProducts | null;

  // Check if any analyzers are still running
  const isAnalyzing = runs.some(r =>
    r.status === 'analyzing' || r.status === 'parsing' || r.status === 'queued'
  );

  // Determine display name
  const displayName = brand.name || basicsData?.business_name || extractDomain(brand.source_url);

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 mb-2">
              {displayName}
            </h1>
            <div className="flex items-center gap-3">
              <a
                href={brand.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-stone-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
              >
                {extractDomain(brand.source_url)}
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-stone-300">•</span>
              <span className="text-sm text-stone-500">
                Added {formatRelativeTime(brand.created_at)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAnalyzing && (
              <Badge variant="info" className="animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                Analyzing...
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Progress & Status */}
        <div className="lg:col-span-1 space-y-6">
          <ProgressList runs={runs} />
        </div>

        {/* Right Column - Analysis Results */}
        <div className="lg:col-span-2 space-y-6">
          <BasicsCard
            data={basicsData}
            isLoading={basicsRun?.status === 'analyzing' || basicsRun?.status === 'parsing'}
          />
          <CustomerCard
            data={customerData}
            isLoading={customerRun?.status === 'analyzing' || customerRun?.status === 'parsing'}
          />
          <ProductsCard
            data={productsData}
            isLoading={productsRun?.status === 'analyzing' || productsRun?.status === 'parsing'}
          />
        </div>
      </div>

      {/* Auto-refresh hint when analyzing */}
      {isAnalyzing && (
        <div className="mt-8 text-center">
          <p className="text-sm text-stone-500">
            Analysis in progress. Refresh the page to see updated results.
          </p>
          <a href={`/brands/${brandId}`}>
            <Button variant="outline" size="sm" className="mt-2">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </a>
        </div>
      )}
    </PageContainer>
  );
}
