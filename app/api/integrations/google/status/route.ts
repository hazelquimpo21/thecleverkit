/**
 * GOOGLE STATUS
 * ==============
 * GET /api/integrations/google/status
 *
 * Returns the user's Google integration connection status.
 *
 * @created 2025-12-19 - Google Docs export feature
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { log } from '@/lib/utils/logger';
import type { IntegrationConnectionStatus } from '@/lib/integrations/types';

export async function GET() {
  try {
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

    // Get profile with Google integration data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('google_email, google_connected_at')
      .eq('id', user.id)
      .single();

    if (profileError) {
      log.error('Google status: Failed to fetch profile', { error: profileError.message });
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    const status: IntegrationConnectionStatus = {
      isConnected: !!profile?.google_connected_at,
      connectedEmail: profile?.google_email ?? null,
      connectedAt: profile?.google_connected_at ?? null,
    };

    return NextResponse.json(status);
  } catch (error) {
    log.error('Google status: Failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
