/**
 * GOOGLE DOCS EXPORT
 * ===================
 * POST /api/export/google-docs
 *
 * Exports a generated doc to Google Docs.
 * Creates a new Google Doc with the content and stores the reference.
 *
 * Request body:
 *   { docId: string }
 *
 * @created 2025-12-19 - Google Docs export feature
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getValidAccessToken, createGoogleDoc } from '@/lib/integrations/google';
import { log } from '@/lib/utils/logger';
import type { GeneratedDoc } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { docId } = body;

    if (!docId) {
      return NextResponse.json(
        { error: 'docId is required' },
        { status: 400 }
      );
    }

    log.info('📤 Google Docs export: Starting', { docId });

    // Get authenticated user
    const supabase = await createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's Google refresh token
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('google_refresh_token')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      log.error('Google Docs export: Failed to fetch profile', { error: profileError?.message });
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    if (!profile.google_refresh_token) {
      log.warn('Google Docs export: Google not connected');
      return NextResponse.json(
        { error: 'Google account not connected', code: 'GOOGLE_NOT_CONNECTED' },
        { status: 400 }
      );
    }

    // Get the generated doc
    const { data: doc, error: docError } = await supabase
      .from('generated_docs')
      .select('*, brands!inner(user_id, name)')
      .eq('id', docId)
      .single();

    if (docError || !doc) {
      log.error('Google Docs export: Doc not found', { error: docError?.message, docId });
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Cast doc to proper type (Supabase join loses type info)
    const typedDoc = doc as unknown as GeneratedDoc & { brands: { user_id: string; name: string | null } };

    // Verify ownership through brand
    if (typedDoc.brands.user_id !== user.id) {
      log.warn('Google Docs export: Unauthorized access attempt', { docId, userId: user.id });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if doc has markdown content
    if (!typedDoc.content_markdown) {
      return NextResponse.json(
        { error: 'Document has no content to export' },
        { status: 400 }
      );
    }

    // Get valid access token
    let accessToken: string;
    try {
      accessToken = await getValidAccessToken(profile.google_refresh_token);
    } catch (tokenError) {
      log.error('Google Docs export: Token refresh failed', {
        error: tokenError instanceof Error ? tokenError.message : 'Unknown',
      });
      // If token refresh fails, the user needs to reconnect
      return NextResponse.json(
        { error: 'Google connection expired. Please reconnect.', code: 'GOOGLE_TOKEN_EXPIRED' },
        { status: 401 }
      );
    }

    // Create Google Doc
    const result = await createGoogleDoc(accessToken, {
      title: typedDoc.title,
      markdownContent: typedDoc.content_markdown,
    });

    // Update our doc record with Google Docs reference
    const { error: updateError } = await supabase
      .from('generated_docs')
      .update({
        google_doc_id: result.documentId,
        google_doc_url: result.documentUrl,
        google_exported_at: new Date().toISOString(),
      })
      .eq('id', docId);

    if (updateError) {
      log.warn('Google Docs export: Failed to update doc record', { error: updateError.message });
      // Don't fail the request - the Google Doc was created successfully
    }

    log.success('📤 Google Docs export: Complete', {
      docId,
      googleDocId: result.documentId,
    });

    return NextResponse.json({
      success: true,
      googleDocId: result.documentId,
      googleDocUrl: result.documentUrl,
    });
  } catch (error) {
    log.error('Google Docs export: Failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to export to Google Docs' },
      { status: 500 }
    );
  }
}
