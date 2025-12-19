/**
 * GOOGLE DISCONNECT
 * ==================
 * POST /api/integrations/google/disconnect
 *
 * Disconnects the user's Google integration.
 * Revokes the token with Google and removes from our database.
 *
 * @created 2025-12-19 - Google Docs export feature
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { revokeToken } from '@/lib/integrations/google';
import { log } from '@/lib/utils/logger';

export async function POST() {
  try {
    log.info('🔓 Google: Disconnecting integration');

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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current profile to check if connected
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('google_refresh_token, google_email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      log.error('Google: Failed to fetch profile', { error: profileError?.message });
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    if (!profile.google_refresh_token) {
      log.warn('Google: Not connected, nothing to disconnect');
      return NextResponse.json(
        { error: 'Google is not connected' },
        { status: 400 }
      );
    }

    // Revoke token with Google (best effort - don't fail if this fails)
    try {
      await revokeToken(profile.google_refresh_token);
    } catch (revokeError) {
      log.warn('Google: Token revocation failed (continuing anyway)', {
        error: revokeError instanceof Error ? revokeError.message : 'Unknown',
      });
    }

    // Clear Google data from profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        google_refresh_token: null,
        google_email: null,
        google_connected_at: null,
      })
      .eq('id', user.id);

    if (updateError) {
      log.error('Google: Failed to clear profile data', { error: updateError.message });
      return NextResponse.json(
        { error: 'Failed to disconnect' },
        { status: 500 }
      );
    }

    log.success('🔓 Google: Disconnected successfully', {
      userId: user.id,
      previousEmail: profile.google_email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Google: Disconnect failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to disconnect Google' },
      { status: 500 }
    );
  }
}
