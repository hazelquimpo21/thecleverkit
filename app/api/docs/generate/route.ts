/**
 * DOC GENERATE API ROUTE
 * =======================
 * Endpoint for generating a document from brand analysis data.
 *
 * This route:
 * 1. Validates the request (brandId, templateId)
 * 2. Checks brand ownership and data readiness
 * 3. Creates a doc record with 'generating' status
 * 4. Runs doc generation (two-step AI process)
 * 5. Updates doc record with content
 *
 * POST /api/docs/generate
 * Body: { brandId: string, templateId: string }
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getAnalysisRuns } from '@/lib/supabase/analysis-runs';
import { createGeneratedDoc, updateGeneratedDoc } from '@/lib/supabase/generated-docs';
import { generateDoc, generateDocTitle } from '@/lib/docs/generator';
import { checkDocReadiness, buildBrandDataFromRuns } from '@/lib/docs/readiness';
import { isValidTemplateId } from '@/lib/docs/registry';
import { log } from '@/lib/utils/logger';
import type { DocTemplateId, Brand } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface GenerateRequest {
  brandId: string;
  templateId: string;
}

interface GenerateResponse {
  success: boolean;
  docId?: string;
  message?: string;
  error?: string;
}

// ============================================================================
// ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse>> {
  log.info('📄 Doc generate request received');

  try {
    // ========================================
    // 1. Parse and validate request
    // ========================================

    const body = await request.json() as GenerateRequest;
    const { brandId, templateId } = body;

    if (!brandId) {
      log.warn('Missing brandId in request');
      return NextResponse.json(
        { success: false, error: 'Brand ID is required' },
        { status: 400 }
      );
    }

    if (!templateId) {
      log.warn('Missing templateId in request');
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }

    if (!isValidTemplateId(templateId)) {
      log.warn('Invalid template ID', { templateId });
      return NextResponse.json(
        { success: false, error: `Unknown template: ${templateId}` },
        { status: 400 }
      );
    }

    const validTemplateId = templateId as DocTemplateId;

    // ========================================
    // 2. Authenticate user
    // ========================================

    const supabase = await createServerClient();

    if (!supabase) {
      log.error('Supabase not configured');
      return NextResponse.json(
        { success: false, error: 'Authentication service is not configured' },
        { status: 503 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      log.warn('Unauthorized doc generate request');
      return NextResponse.json(
        { success: false, error: 'Please log in to generate documents' },
        { status: 401 }
      );
    }

    log.info('👤 User authenticated', { userId: user.id });

    // ========================================
    // 3. Fetch brand and verify ownership
    // ========================================

    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('*')
      .eq('id', brandId)
      .single();

    if (brandError || !brand) {
      log.warn('Brand not found', { brandId });
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Verify ownership (RLS should handle this, but double-check)
    if ((brand as Brand).user_id !== user.id) {
      log.warn('Brand ownership mismatch', { brandId, userId: user.id });
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      );
    }

    log.info('Brand verified', { brandId, name: brand.name });

    // ========================================
    // 4. Check data readiness
    // ========================================

    const { runs, error: runsError } = await getAnalysisRuns(brandId);

    if (runsError) {
      log.error('Failed to fetch analysis runs', { error: runsError });
      return NextResponse.json(
        { success: false, error: 'Failed to check brand data' },
        { status: 500 }
      );
    }

    const readiness = checkDocReadiness(runs, validTemplateId);

    if (!readiness.isReady) {
      log.warn('Brand not ready for template', {
        templateId,
        missingAnalyzers: readiness.missingAnalyzers,
      });

      const missingInfo = readiness.missingAnalyzers.length > 0
        ? `Missing analyzers: ${readiness.missingAnalyzers.join(', ')}`
        : `Missing fields: ${readiness.missingFields.map(f => f.description).join(', ')}`;

      return NextResponse.json(
        { success: false, error: `Not enough data to generate this document. ${missingInfo}` },
        { status: 422 }
      );
    }

    // ========================================
    // 5. Build brand data
    // ========================================

    // Determine brand name (fallback chain)
    const basicsRun = runs.find(r => r.analyzer_type === 'basics' && r.status === 'complete');
    const basicsData = basicsRun?.parsed_data as { business_name?: string } | null;
    const brandName = (brand as Brand).name || basicsData?.business_name || 'Unknown Brand';

    const brandData = buildBrandDataFromRuns(brandName, (brand as Brand).source_url, runs);

    // ========================================
    // 6. Create doc record (generating status)
    // ========================================

    const title = generateDocTitle(validTemplateId, brandData);

    const { doc, error: createError } = await createGeneratedDoc({
      brand_id: brandId,
      template_id: validTemplateId,
      title,
      source_data: brandData as unknown as Record<string, unknown>,
      status: 'generating',
    });

    if (createError || !doc) {
      log.error('Failed to create doc record', { error: createError });
      return NextResponse.json(
        { success: false, error: 'Failed to start document generation' },
        { status: 500 }
      );
    }

    log.info('Doc record created', { docId: doc.id });

    // ========================================
    // 7. Generate document content
    // ========================================

    const result = await generateDoc({
      brandId,
      templateId: validTemplateId,
      brandData,
    });

    if (!result.success || !result.parsedContent) {
      log.error('Doc generation failed', { error: result.error });

      // Update doc record with error
      await updateGeneratedDoc(doc.id, {
        status: 'error',
        error_message: result.error || 'Generation failed',
      });

      return NextResponse.json(
        { success: false, docId: doc.id, error: result.error || 'Failed to generate document' },
        { status: 500 }
      );
    }

    // ========================================
    // 8. Save generated content
    // ========================================

    await updateGeneratedDoc(doc.id, {
      content: result.parsedContent as Record<string, unknown>,
      content_markdown: result.markdown || null,
      status: 'complete',
      error_message: null,
    });

    log.success('Doc generation complete', {
      docId: doc.id,
      templateId,
      duration: `${(result.durationMs / 1000).toFixed(2)}s`,
    });

    // ========================================
    // 9. Return success
    // ========================================

    return NextResponse.json({
      success: true,
      docId: doc.id,
      message: 'Document generated successfully!',
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error('Doc generate endpoint error', { error: message });

    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
