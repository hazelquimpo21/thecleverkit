/**
 * ANALYZE CONTINUATION COMPONENT
 * ================================
 * Client component that handles the post-login analysis flow.
 * Retrieves saved analysis intent and lets user continue or modify.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, ArrowRight, Sparkles, Edit3 } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getAnalysisIntent,
  clearAnalysisIntent,
  type AnalysisIntent,
} from '@/lib/utils/auth-intent';
import { log } from '@/lib/utils/logger';

// ============================================================================
// TYPES
// ============================================================================

type ViewState = 'loading' | 'continue' | 'edit' | 'no-intent' | 'analyzing';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Main analyze continuation component.
 * Handles the post-login flow for brand analysis.
 */
export function AnalyzeContinuation() {
  const router = useRouter();
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [savedIntent, setSavedIntent] = useState<AnalysisIntent | null>(null);
  const [editableUrl, setEditableUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load saved intent on mount
  useEffect(() => {
    log.info('Analyze continuation page loaded');

    const intent = getAnalysisIntent();

    if (intent) {
      log.info('Found saved analysis intent', { url: intent.url });
      setSavedIntent(intent);
      setEditableUrl(intent.url);
      setViewState('continue');
    } else {
      log.info('No saved analysis intent, redirecting to home');
      setViewState('no-intent');
      // Redirect to home after a moment
      setTimeout(() => {
        router.replace('/');
      }, 2000);
    }
  }, [router]);

  /**
   * Start the brand analysis with the current URL
   */
  const handleAnalyze = async (url: string) => {
    setError(null);
    setViewState('analyzing');
    log.info('Starting analysis from continuation page', { url });

    try {
      const response = await fetch('/api/brands/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        log.error('Analysis failed', { error: data.error });
        setError(data.error || 'Failed to analyze brand');
        setViewState('continue');
        return;
      }

      // Clear the saved intent - analysis started successfully
      clearAnalysisIntent();
      log.success('Analysis started', { brandId: data.brandId });

      // Redirect to brand page
      router.push(`/brands/${data.brandId}`);
    } catch (err) {
      log.error('Unexpected error', {
        error: err instanceof Error ? err.message : 'Unknown',
      });
      setError('Something went wrong. Please try again.');
      setViewState('continue');
    }
  };

  /**
   * Handle confirm - analyze with the original saved URL
   */
  const handleConfirm = () => {
    if (savedIntent) {
      handleAnalyze(savedIntent.url);
    }
  };

  /**
   * Handle save from edit mode
   */
  const handleSaveEdit = () => {
    const trimmedUrl = editableUrl.trim();
    if (!trimmedUrl) {
      setError('Please enter a URL');
      return;
    }
    handleAnalyze(trimmedUrl);
  };

  /**
   * Cancel and go back to home
   */
  const handleCancel = () => {
    clearAnalysisIntent();
    router.push('/');
  };

  // ============================================================================
  // RENDER STATES
  // ============================================================================

  // Loading state
  if (viewState === 'loading') {
    return (
      <PageContainer className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <Sparkles className="h-12 w-12 text-orange-500 mx-auto" />
          </div>
          <p className="text-stone-500">Loading your analysis...</p>
        </div>
      </PageContainer>
    );
  }

  // No intent found - redirecting
  if (viewState === 'no-intent') {
    return (
      <PageContainer className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <Globe className="h-12 w-12 text-stone-300 mx-auto" />
            <h2 className="text-xl font-semibold text-stone-900">
              No pending analysis
            </h2>
            <p className="text-stone-500">
              Redirecting you to the home page...
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  // Analyzing state
  if (viewState === 'analyzing') {
    return (
      <PageContainer className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-6">
            <div className="animate-pulse">
              <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <Globe className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-stone-900">
                Starting analysis...
              </h2>
              <p className="text-stone-500">
                We&apos;re scraping the website and preparing your brand intelligence.
              </p>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  // Edit mode
  if (viewState === 'edit') {
    return (
      <PageContainer className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Edit3 className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-stone-900">
                Edit URL
              </h2>
              <p className="text-sm text-stone-500">
                Change the website you want to analyze
              </p>
            </div>

            {/* URL Input */}
            <div className="space-y-3">
              <Input
                type="text"
                value={editableUrl}
                onChange={(e) => setEditableUrl(e.target.value)}
                placeholder="https://example.com"
                error={error || undefined}
                autoFocus
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setEditableUrl(savedIntent?.url || '');
                  setError(null);
                  setViewState('continue');
                }}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSaveEdit}>
                Analyze This
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  // Continue mode (default)
  return (
    <PageContainer className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-lg w-full">
        <CardContent className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                You&apos;re signed in!
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-stone-900 mt-4">
              Ready to analyze
            </h2>
          </div>

          {/* Saved URL display */}
          <div className="bg-stone-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-600">
                Website to analyze
              </span>
              <button
                onClick={() => setViewState('edit')}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Change
              </button>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-stone-200">
              <Globe className="h-5 w-5 text-stone-400 flex-shrink-0" />
              <span className="text-stone-900 font-medium truncate">
                {savedIntent?.url}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-600 text-center bg-red-50 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={handleConfirm}>
              Start Analysis
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              className="w-full text-stone-500"
              onClick={handleCancel}
            >
              Cancel and go home
            </Button>
          </div>

          {/* Info */}
          <p className="text-xs text-center text-stone-400">
            We&apos;ll scrape the homepage and extract brand intelligence using AI.
            This usually takes about 60 seconds.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
