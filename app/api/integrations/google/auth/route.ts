/**
 * GOOGLE OAUTH INITIATE
 * ======================
 * POST /api/integrations/google/auth
 *
 * Initiates Google OAuth flow by returning the authorization URL.
 * Called when user clicks "Connect Google Account".
 *
 * @created 2025-12-19 - Google Docs export feature
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { buildGoogleAuthUrl } from '@/lib/integrations/google';
import { log } from '@/lib/utils/logger';

export async function POST() {
  try {
    log.info('🔗 Google OAuth: Initiating auth flow');

    // Get the authenticated user
    const supabase = await createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      log.warn('Google OAuth: Unauthorized request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Build state parameter (for CSRF protection and user identification)
    // We encode the user ID so we can verify it in the callback
    const state = Buffer.from(
      JSON.stringify({
        userId: user.id,
        timestamp: Date.now(),
      })
    ).toString('base64');

    // Build the OAuth URL
    const authUrl = buildGoogleAuthUrl(state);

    log.info('🔗 Google OAuth: Auth URL generated', { userId: user.id });

    return NextResponse.json({
      authUrl,
    });
  } catch (error) {
    log.error('Google OAuth: Failed to initiate', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    );
  }
}
