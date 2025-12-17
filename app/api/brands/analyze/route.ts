/**
 * BRAND ANALYZE API ROUTE
 * ========================
 * Main endpoint for analyzing a brand from a URL.
 *
 * This route:
 * 1. Creates a brand record
 * 2. Scrapes the website
 * 3. Creates analysis run records
 * 4. Runs all analyzers concurrently
 *
 * POST /api/brands/analyze
 * Body: { url: string, isOwnBrand?: boolean }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createBrand, updateBrandAdmin } from '@/lib/supabase/brands';
import { createAnalysisRuns } from '@/lib/supabase/analysis-runs';
import { scrapeWebHomepage } from '@/lib/scrapers';
import { runAllAnalyzers } from '@/lib/analyzers/runner';
import { log } from '@/lib/utils/logger';
import { isValidUrl, ensureProtocol } from '@/lib/utils/format';

// ============================================================================
// TYPES
// ============================================================================

interface AnalyzeRequest {
  url: string;
  isOwnBrand?: boolean;
}

interface AnalyzeResponse {
  success: boolean;
  brandId?: string;
  message?: string;
  error?: string;
}

// ============================================================================
// ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  log.info('📥 Analyze request received');

  try {
    // ========================================
    // 1. Parse and validate request
    // ========================================

    const body = await request.json() as AnalyzeRequest;
    const { url, isOwnBrand = false } = body;

    if (!url) {
      log.warn('Missing URL in request');
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    const normalizedUrl = ensureProtocol(url);

    if (!isValidUrl(normalizedUrl)) {
      log.warn('Invalid URL provided', { url });
      return NextResponse.json(
        { success: false, error: 'Please enter a valid URL' },
        { status: 400 }
      );
    }

    // ========================================
    // 2. Authenticate user
    // ========================================

    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      log.warn('Unauthorized analyze request');
      return NextResponse.json(
        { success: false, error: 'Please log in to analyze a brand' },
        { status: 401 }
      );
    }

    log.info('👤 User authenticated', { userId: user.id });

    // ========================================
    // 3. Create brand record
    // ========================================

    const { brand, error: brandError } = await createBrand({
      userId: user.id,
      sourceUrl: normalizedUrl,
      isOwnBrand,
    });

    if (brandError || !brand) {
      log.error('Failed to create brand', { error: brandError });
      return NextResponse.json(
        { success: false, error: brandError || 'Failed to create brand' },
        { status: 500 }
      );
    }

    log.success('Brand created', { brandId: brand.id, url: normalizedUrl });

    // ========================================
    // 4. Scrape the website
    // ========================================

    // Update status to scraping
    await updateBrandAdmin(brand.id, { scrapeStatus: 'scraping' });

    const scrapeResult = await scrapeWebHomepage(normalizedUrl);

    if (!scrapeResult.success || !scrapeResult.content) {
      log.error('Scraping failed', { error: scrapeResult.error });

      await updateBrandAdmin(brand.id, {
        scrapeStatus: 'failed',
        scrapeError: scrapeResult.error || 'Failed to scrape website',
      });

      return NextResponse.json(
        { success: false, brandId: brand.id, error: scrapeResult.error },
        { status: 422 }
      );
    }

    // Save scraped content
    await updateBrandAdmin(brand.id, {
      name: scrapeResult.metadata?.title || null,
      scrapedContent: scrapeResult.content,
      scrapedAt: new Date().toISOString(),
      scrapeStatus: 'complete',
      scrapeError: null,
    });

    log.success('Scraping complete', {
      brandId: brand.id,
      contentLength: scrapeResult.content.length,
    });

    // ========================================
    // 5. Create analysis runs
    // ========================================

    const { runs, error: runsError } = await createAnalysisRuns(brand.id);

    if (runsError) {
      log.error('Failed to create analysis runs', { error: runsError });
      return NextResponse.json(
        { success: false, brandId: brand.id, error: 'Failed to start analysis' },
        { status: 500 }
      );
    }

    log.info('Analysis runs created', { count: runs.length });

    // ========================================
    // 6. Run analyzers (async, don't wait)
    // ========================================

    // Start analysis in background - don't await
    // The client will poll/subscribe for updates
    runAllAnalyzers(brand.id, scrapeResult.content).catch(err => {
      log.error('Background analysis failed', { brandId: brand.id, error: err.message });
    });

    log.success('Analysis started', { brandId: brand.id });

    // ========================================
    // 7. Return success
    // ========================================

    return NextResponse.json({
      success: true,
      brandId: brand.id,
      message: 'Analysis started! Results will appear as they complete.',
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error('Analyze endpoint error', { error: message });

    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
