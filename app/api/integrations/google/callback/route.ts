/**
 * GOOGLE OAUTH CALLBACK
 * ======================
 * GET /api/integrations/google/callback
 *
 * Handles the OAuth callback from Google.
 * Exchanges the code for tokens and stores the refresh token.
 *
 * @created 2025-12-19 - Google Docs export feature
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { exchangeCodeForTokens } from '@/lib/integrations/google';
import { log } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    log.info('🔐 Google OAuth: Callback received', {
      hasCode: !!code,
      hasState: !!state,
      error: error || 'none',
    });

    // Handle user denial or error
    if (error) {
      log.warn('Google OAuth: User denied or error occurred', { error });
      return redirectWithError('access_denied', request);
    }

    // Validate required params
    if (!code || !state) {
      log.error('Google OAuth: Missing code or state');
      return redirectWithError('invalid_request', request);
    }

    // Decode and validate state
    let stateData: { userId: string; timestamp: number };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    } catch {
      log.error('Google OAuth: Invalid state parameter');
      return redirectWithError('invalid_state', request);
    }

    // Check state isn't too old (10 minute expiry)
    const stateAge = Date.now() - stateData.timestamp;
    if (stateAge > 10 * 60 * 1000) {
      log.error('Google OAuth: State expired', { ageMs: stateAge });
      return redirectWithError('state_expired', request);
    }

    // Get authenticated user and verify it matches state
    const supabase = await createServerClient();
    if (!supabase) {
      return redirectWithError('server_error', request);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      log.error('Google OAuth: User not authenticated');
      return redirectWithError('unauthorized', request);
    }

    if (user.id !== stateData.userId) {
      log.error('Google OAuth: User ID mismatch', {
        expected: stateData.userId,
        actual: user.id,
      });
      return redirectWithError('user_mismatch', request);
    }

    // Exchange code for tokens
    const { tokens, email } = await exchangeCodeForTokens(code);

    // Store refresh token in user's profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        google_refresh_token: tokens.refreshToken,
        google_email: email,
        google_connected_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      log.error('Google OAuth: Failed to store tokens', {
        error: updateError.message,
        code: updateError.code,
        hint: updateError.hint,
        details: updateError.details,
      });
      // Common cause: migration not run (column doesn't exist)
      if (updateError.message?.includes('column') || updateError.code === '42703') {
        log.error('HINT: Run the migration: supabase/migrations/001_google_docs_export.sql');
      }
      return redirectWithError('storage_failed', request);
    }

    log.success('🔐 Google OAuth: Connection successful', {
      userId: user.id,
      googleEmail: email,
    });

    // Redirect to success page (close popup)
    return redirectWithSuccess(request);
  } catch (error) {
    log.error('Google OAuth: Callback failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return redirectWithError('server_error', request);
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Redirect with success (to a page that closes the popup).
 */
function redirectWithSuccess(request: NextRequest): NextResponse {
  const origin = request.nextUrl.origin;
  // This page will post a message to the parent window and close
  return NextResponse.redirect(`${origin}/integrations/google/success`);
}

/**
 * Redirect with error.
 */
function redirectWithError(errorCode: string, request: NextRequest): NextResponse {
  const origin = request.nextUrl.origin;
  return NextResponse.redirect(`${origin}/integrations/google/error?code=${errorCode}`);
}
