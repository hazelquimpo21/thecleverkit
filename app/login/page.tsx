/**
 * LOGIN PAGE
 * ===========
 * Authentication page with magic link sign-in.
 * Redirects authenticated users to the dashboard.
 *
 * Features:
 * - Magic link authentication via Supabase
 * - Error handling for failed auth callbacks
 * - Clean, minimal design
 */

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// ============================================================================
// TYPES
// ============================================================================

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  // Check if user is already authenticated
  const supabase = await createServerClient();

  // Only check auth if Supabase is configured
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();

    // Redirect authenticated users to dashboard (or their intended destination)
    if (user) {
      redirect(params.next || '/dashboard');
    }
  }

  // Determine redirect URL after login
  const redirectTo = params.next || '/dashboard';

  // Check for auth error from callback
  const authError = params.error === 'auth_callback_failed'
    ? 'Authentication failed. Please try again.'
    : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and welcome */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold text-stone-900"
          >
            <Sparkles className="h-8 w-8 text-orange-500" />
            <span>The Clever Kit</span>
          </Link>
          <p className="mt-3 text-stone-600">
            AI-powered brand intelligence for agencies and freelancers.
          </p>
        </div>

        {/* Login card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to access your brand analyses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error message */}
            {authError && (
              <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                <p>{authError}</p>
              </div>
            )}

            {/* Login form */}
            <LoginForm redirectTo={redirectTo} />
          </CardContent>
        </Card>

        {/* Footer text */}
        <p className="text-center text-sm text-stone-500">
          Don&apos;t have an account?{' '}
          <span className="text-stone-700">
            Enter your email above to create one automatically.
          </span>
        </p>
      </div>
    </div>
  );
}
