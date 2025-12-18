/**
 * ADD BRAND FORM COMPONENT
 * ==========================
 * Form for adding a new brand via URL.
 * Includes smart auth handling - if user isn't logged in,
 * saves their URL and redirects to login, then continues after.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthGate } from '@/hooks';
import { clearAnalysisIntent } from '@/lib/utils/auth-intent';
import { log } from '@/lib/utils/logger';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Form to add a new brand by entering a website URL.
 * Handles authentication gating - redirects to login if needed
 * while preserving the user's intended URL.
 *
 * @example
 * <AddBrandForm />
 */
export function AddBrandForm() {
  const router = useRouter();
  const { requireAuth, isAuthenticated, isLoading: authLoading } = useAuthGate();

  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle form submission.
   * Checks auth first, then proceeds with analysis.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate URL is provided
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('Please enter a website URL');
      return;
    }

    log.info('Analyze form submitted', { url: trimmedUrl });

    // Gate behind authentication
    // If not authenticated, this will redirect to login with the URL saved
    if (!requireAuth({ analysisUrl: trimmedUrl })) {
      log.info('User not authenticated, redirecting to login');
      return;
    }

    // User is authenticated - proceed with analysis
    await startAnalysis(trimmedUrl);
  };

  /**
   * Start the brand analysis process.
   * Called after auth is confirmed.
   */
  const startAnalysis = async (analysisUrl: string) => {
    setIsLoading(true);
    log.info('Starting brand analysis', { url: analysisUrl });

    try {
      const response = await fetch('/api/brands/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: analysisUrl }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        log.error('Analysis failed', { error: data.error });
        setError(data.error || 'Failed to analyze brand');
        setIsLoading(false);
        return;
      }

      // Clear any saved intent since analysis succeeded
      clearAnalysisIntent();

      log.success('Analysis started, redirecting to brand page', {
        brandId: data.brandId,
      });

      // Redirect to brand page
      router.push(`/brands/${data.brandId}`);
    } catch (err) {
      log.error('Unexpected error during analysis', {
        error: err instanceof Error ? err.message : 'Unknown',
      });
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-3">
              <Globe className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-stone-900">
              Analyze a Brand
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Enter a website URL to get instant brand intelligence
            </p>
          </div>

          {/* URL Input */}
          <div className="relative">
            <Input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              error={error || undefined}
              disabled={isLoading}
              className="pr-32"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading || authLoading}
            loadingText={authLoading ? 'Checking...' : 'Analyzing...'}
          >
            Analyze Brand
            <ArrowRight className="w-4 h-4" />
          </Button>

          {/* Auth hint - shows when not authenticated */}
          {!authLoading && !isAuthenticated && (
            <AuthHint />
          )}

          {/* Help text - shows when authenticated */}
          {isAuthenticated && (
            <p className="text-xs text-center text-stone-400">
              We&apos;ll scrape the homepage and analyze the brand using AI
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Hint shown to unauthenticated users.
 * Lets them know they'll need to sign in, but doesn't block the form.
 */
function AuthHint() {
  return (
    <div className="flex items-center justify-center gap-2 text-xs text-stone-500 bg-stone-50 rounded-lg px-3 py-2">
      <Lock className="w-3.5 h-3.5 text-stone-400" />
      <span>
        You&apos;ll sign in after clicking to save your analysis
      </span>
    </div>
  );
}
