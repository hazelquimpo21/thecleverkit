/**
 * LOGIN FORM COMPONENT
 * =====================
 * Email input form for Supabase magic link authentication.
 * Clean, minimal design following the app's warm aesthetic.
 *
 * Usage:
 *   <LoginForm redirectTo="/dashboard" />
 */

'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { log } from '@/lib/utils/logger';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface LoginFormProps {
  /** URL to redirect to after successful authentication */
  redirectTo?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Email login form with magic link support.
 * Shows success state after sending the magic link.
 *
 * @example
 * <LoginForm redirectTo="/dashboard" />
 */
export function LoginForm({ redirectTo = '/dashboard' }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient();

  /**
   * Handle magic link sign in
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    log.info('Initiating magic link sign in', { email });

    try {
      // Check if Supabase is available
      if (!supabase) {
        throw new Error(
          'Authentication is not configured. Please set up Supabase environment variables.'
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Get the app URL for the redirect
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const callbackUrl = `${appUrl}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`;

      log.debug('Magic link callback URL', { callbackUrl });

      // Send the magic link
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: callbackUrl,
        },
      });

      if (signInError) {
        log.error('Magic link send failed', { error: signInError.message });
        throw new Error(signInError.message);
      }

      log.success('Magic link sent successfully', { email });
      setIsEmailSent(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      log.error('Sign in error', { error: message });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // SUCCESS STATE
  // ============================================================================

  if (isEmailSent) {
    return (
      <div className="text-center space-y-4">
        {/* Success icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>

        {/* Success message */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-stone-900">
            Check your email
          </h2>
          <p className="text-stone-600 max-w-sm mx-auto">
            We sent a magic link to{' '}
            <span className="font-medium text-stone-900">{email}</span>.
            Click the link to sign in.
          </p>
        </div>

        {/* Resend option */}
        <div className="pt-4">
          <button
            onClick={() => {
              setIsEmailSent(false);
              setEmail('');
            }}
            className="text-sm text-orange-600 hover:text-orange-700 underline-offset-4 hover:underline"
          >
            Use a different email
          </button>
        </div>

        {/* Email tips */}
        <div className="pt-6 text-xs text-stone-500 space-y-1">
          <p>Didn&apos;t receive the email?</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Check your spam or junk folder</li>
            <li>Make sure the email address is correct</li>
          </ul>
        </div>
      </div>
    );
  }

  // ============================================================================
  // FORM STATE
  // ============================================================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email input */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-stone-700"
        >
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
            autoFocus
            autoComplete="email"
            disabled={isLoading}
            error={error || undefined}
          />
        </div>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        isLoading={isLoading}
        loadingText="Sending link..."
      >
        Continue with Email
        <ArrowRight className="h-4 w-4" />
      </Button>

      {/* Helper text */}
      <p className="text-xs text-center text-stone-500">
        We&apos;ll send you a magic link to sign in.
        No password needed.
      </p>
    </form>
  );
}
