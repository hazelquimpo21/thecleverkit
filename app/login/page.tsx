/**
 * LOGIN PAGE
 * ===========
 * Authentication page with magic link sign-in.
 * Supports intent-based messaging when user is redirected from a gated action.
 *
 * Features:
 * - Magic link authentication via Supabase
 * - Error handling for failed auth callbacks
 * - Intent-aware messaging (e.g., "Sign in to analyze [URL]")
 * - Clean design with 1960s science textbook aesthetic
 *
 * Query Params:
 * - error: Auth error type (e.g., "auth_callback_failed")
 * - next: Where to redirect after login
 * - intent: What action triggered the login (e.g., "analyze")
 *
 * @update 2025-12-19 - Updated styling for design system
 */

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { LoginPageContent } from './login-page-content';

// ============================================================================
// TYPES
// ============================================================================

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    next?: string;
    intent?: string;
  }>;
}

// ============================================================================
// PAGE COMPONENT (SERVER)
// ============================================================================

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  // Check if user is already authenticated
  const supabase = await createServerClient();

  // Only check auth if Supabase is configured
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();

    // Redirect authenticated users to their intended destination
    if (user) {
      redirect(params.next || '/dashboard');
    }
  }

  // Determine redirect URL after login
  const redirectTo = params.next || '/dashboard';

  // Check what intent brought them here
  const intent = params.intent || null;

  // Check for auth error from callback
  const authError = params.error === 'auth_callback_failed'
    ? 'Authentication failed. Please try again.'
    : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and welcome */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold text-foreground"
          >
            <Sparkles className="h-8 w-8 text-primary" />
            <span>The Clever Kit</span>
          </Link>
          <p className="mt-3 text-foreground-muted">
            AI-powered brand intelligence for agencies and freelancers.
          </p>
        </div>

        {/* Login card with intent-aware content */}
        <Card className="shadow-warm-lg">
          <CardHeader className="text-center pb-2">
            {/* Client component handles intent-aware messaging */}
            <LoginPageContent
              intent={intent}
              redirectTo={redirectTo}
              authError={authError}
            />
          </CardHeader>
          <CardContent>
            {/* Error message */}
            {authError && (
              <div className="mb-6 flex items-start gap-3 rounded-lg bg-[var(--error)]/10 p-4 text-sm text-[var(--error)]">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{authError}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer text */}
        <p className="text-center text-sm text-foreground-muted">
          Don&apos;t have an account?{' '}
          <span className="text-foreground">
            Enter your email above to create one automatically.
          </span>
        </p>
      </div>
    </div>
  );
}
