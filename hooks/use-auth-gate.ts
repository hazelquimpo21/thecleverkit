/**
 * USE AUTH GATE HOOK
 * ===================
 * Hook for gating actions behind authentication.
 * Provides utilities to check auth status and redirect to login if needed,
 * while preserving the user's intent for after they sign in.
 *
 * Usage:
 *   const { requireAuth, isAuthenticated } = useAuthGate();
 *
 *   const handleAnalyze = (url: string) => {
 *     if (requireAuth({ analysisUrl: url })) {
 *       // User is authenticated, proceed
 *       startAnalysis(url);
 *     }
 *     // If not authenticated, requireAuth handles redirect automatically
 *   };
 */

'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './use-auth';
import { saveAnalysisIntent, clearAnalysisIntent } from '@/lib/utils/auth-intent';
import { log } from '@/lib/utils/logger';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Options for the requireAuth function
 */
interface RequireAuthOptions {
  /** URL the user wanted to analyze (will be saved for post-login) */
  analysisUrl?: string;
  /** Whether the URL is the user's own brand */
  isOwnBrand?: boolean;
  /** Custom redirect path after login (defaults to /analyze if analysisUrl provided) */
  redirectAfterLogin?: string;
}

/**
 * Return type for the useAuthGate hook
 */
interface AuthGateResult {
  /** Whether the user is currently authenticated */
  isAuthenticated: boolean;
  /** Whether auth state is still loading */
  isLoading: boolean;
  /** Current user (if authenticated) */
  user: ReturnType<typeof useAuth>['user'];
  /**
   * Gate an action behind authentication.
   * Returns true if authenticated (action can proceed).
   * If not authenticated, saves intent and redirects to login.
   */
  requireAuth: (options?: RequireAuthOptions) => boolean;
  /**
   * Redirect to login with optional intent preservation.
   * Use this for explicit "sign in to continue" flows.
   */
  redirectToLogin: (options?: RequireAuthOptions) => void;
  /**
   * Clear any saved analysis intent.
   * Call this when user cancels or completes the action.
   */
  clearIntent: () => void;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for gating actions behind authentication.
 *
 * @returns Auth gate utilities
 *
 * @example
 * function AddBrandForm() {
 *   const { requireAuth, isAuthenticated } = useAuthGate();
 *
 *   const handleSubmit = (url: string) => {
 *     if (!requireAuth({ analysisUrl: url })) {
 *       return; // User will be redirected to login
 *     }
 *     // Proceed with analysis
 *   };
 *
 *   return (
 *     <form>
 *       {!isAuthenticated && (
 *         <p>You'll need to sign in to analyze</p>
 *       )}
 *     </form>
 *   );
 * }
 */
export function useAuthGate(): AuthGateResult {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const isAuthenticated = !!user && !isLoading;

  /**
   * Redirect to login page with intent preservation
   */
  const redirectToLogin = useCallback(
    (options: RequireAuthOptions = {}) => {
      const { analysisUrl, isOwnBrand, redirectAfterLogin } = options;

      // Save analysis intent if URL provided
      if (analysisUrl) {
        const saved = saveAnalysisIntent({
          url: analysisUrl,
          isOwnBrand,
        });

        if (saved) {
          log.info('Redirecting to login with analysis intent', {
            url: analysisUrl,
          });
        }
      }

      // Build login URL with appropriate redirect
      const loginUrl = new URL('/login', window.location.origin);

      // If we have an analysis intent, redirect to /analyze after login
      // Otherwise, use the provided redirect or default to dashboard
      if (analysisUrl) {
        loginUrl.searchParams.set('next', '/analyze');
        loginUrl.searchParams.set('intent', 'analyze');
      } else if (redirectAfterLogin) {
        loginUrl.searchParams.set('next', redirectAfterLogin);
      }

      router.push(loginUrl.toString());
    },
    [router]
  );

  /**
   * Gate an action behind authentication
   * Returns true if authenticated, false if redirecting
   */
  const requireAuth = useCallback(
    (options: RequireAuthOptions = {}): boolean => {
      // Still loading - can't determine auth state
      if (isLoading) {
        log.debug('Auth state still loading, cannot gate action');
        return false;
      }

      // User is authenticated - action can proceed
      if (user) {
        log.debug('User authenticated, action allowed');
        return true;
      }

      // User is not authenticated - redirect to login
      log.info('Action requires auth, redirecting to login');
      redirectToLogin(options);
      return false;
    },
    [user, isLoading, redirectToLogin]
  );

  /**
   * Clear any saved analysis intent
   */
  const clearIntent = useCallback(() => {
    clearAnalysisIntent();
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
    requireAuth,
    redirectToLogin,
    clearIntent,
  };
}
