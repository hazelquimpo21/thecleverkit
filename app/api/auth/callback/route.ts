/**
 * AUTH CALLBACK ROUTE
 * ====================
 * Handles the OAuth callback from Supabase Auth.
 * Exchanges the auth code for a session.
 *
 * This route is called after a user authenticates via:
 * - Magic link
 * - Google OAuth
 * - Other OAuth providers
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { log } from '@/lib/utils/logger';
import type { Database } from '@/types';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  log.info('🔐 Auth callback received', {
    hasCode: !!code,
    redirectTo: next,
  });

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Handle error in Server Component context
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      log.success('Auth session created, redirecting', { to: next });
      return NextResponse.redirect(`${origin}${next}`);
    }

    log.error('Auth session exchange failed', { error: error.message });
  }

  // Return to login with error
  log.warn('Auth callback failed, redirecting to login');
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
