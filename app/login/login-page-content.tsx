/**
 * LOGIN PAGE CONTENT
 * ===================
 * Client component for the login page that handles intent-aware messaging.
 * Shows different UI based on whether user was redirected from an action.
 *
 * When intent='analyze', reads the saved URL from localStorage and shows
 * a message like "Sign in to continue analyzing [url]"
 */

'use client';

import { useEffect, useState } from 'react';
import { Globe, Sparkles } from 'lucide-react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';
import { getAnalysisIntent, type AnalysisIntent } from '@/lib/utils/auth-intent';

// ============================================================================
// TYPES
// ============================================================================

interface LoginPageContentProps {
  /** The intent that brought the user here (e.g., "analyze") */
  intent: string | null;
  /** Where to redirect after login */
  redirectTo: string;
  /** Any auth error to display */
  authError: string | null;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Client-side content for the login page.
 * Handles intent-aware messaging based on what action the user was trying to do.
 */
export function LoginPageContent({
  intent,
  redirectTo,
  authError,
}: LoginPageContentProps) {
  const [analysisIntent, setAnalysisIntent] = useState<AnalysisIntent | null>(null);

  // Load saved analysis intent on mount (client-side only)
  useEffect(() => {
    if (intent === 'analyze') {
      const savedIntent = getAnalysisIntent();
      if (savedIntent) {
        setAnalysisIntent(savedIntent);
      }
    }
  }, [intent]);

  // Show analysis-specific UI when user was trying to analyze a brand
  if (intent === 'analyze' && analysisIntent) {
    return (
      <AnalyzeIntentContent
        url={analysisIntent.url}
        redirectTo={redirectTo}
      />
    );
  }

  // Default login UI
  return (
    <DefaultLoginContent redirectTo={redirectTo} />
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Login content shown when user was trying to analyze a brand
 */
function AnalyzeIntentContent({
  url,
  redirectTo,
}: {
  url: string;
  redirectTo: string;
}) {
  // Truncate long URLs for display
  const displayUrl = truncateUrl(url, 35);

  return (
    <div className="space-y-6">
      {/* Intent indicator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm">
          <Globe className="h-4 w-4" />
          <span className="font-medium">Analysis pending</span>
        </div>
      </div>

      {/* Title and description */}
      <div className="space-y-2 text-center">
        <CardTitle className="text-xl">Sign in to continue</CardTitle>
        <CardDescription className="text-sm">
          Your analysis of{' '}
          <span className="font-medium text-stone-700">{displayUrl}</span>{' '}
          is ready to start
        </CardDescription>
      </div>

      {/* Login form */}
      <LoginForm redirectTo={redirectTo} />

      {/* Reassurance */}
      <p className="text-xs text-center text-stone-400">
        We saved your URL. After signing in, you&apos;ll continue right where you left off.
      </p>
    </div>
  );
}

/**
 * Default login content when no specific intent
 */
function DefaultLoginContent({ redirectTo }: { redirectTo: string }) {
  return (
    <div className="space-y-6">
      {/* Sparkle decoration */}
      <div className="flex items-center justify-center">
        <div className="p-3 bg-orange-50 rounded-full">
          <Sparkles className="h-6 w-6 text-orange-500" />
        </div>
      </div>

      {/* Title and description */}
      <div className="space-y-2 text-center">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to access your brand analyses
        </CardDescription>
      </div>

      {/* Login form */}
      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Truncate a URL to a maximum length, keeping the domain visible
 */
function truncateUrl(url: string, maxLength: number): string {
  if (url.length <= maxLength) {
    return url;
  }

  try {
    const parsed = new URL(url);
    const domain = parsed.hostname;

    // If domain alone fits, show domain + "..."
    if (domain.length < maxLength - 3) {
      return `${domain}...`;
    }

    // Otherwise truncate from the end
    return `${url.slice(0, maxLength - 3)}...`;
  } catch {
    // If URL parsing fails, just truncate
    return `${url.slice(0, maxLength - 3)}...`;
  }
}
