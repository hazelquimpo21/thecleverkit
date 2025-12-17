/**
 * AUTH HOOK
 * ==========
 * React hook for managing authentication state with Supabase.
 * Provides current user, loading state, and auth actions.
 *
 * Usage:
 *   const { user, isLoading, signOut } = useAuth();
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { log } from '@/lib/utils/logger';
import type { User } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

interface AuthState {
  /** Current authenticated user, or null if not logged in */
  user: User | null;
  /** Whether auth state is still being determined */
  isLoading: boolean;
  /** Sign out the current user */
  signOut: () => Promise<void>;
  /** Refresh user data from Supabase */
  refreshUser: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for managing authentication state.
 * Automatically subscribes to auth state changes.
 *
 * @returns Current user, loading state, and auth actions
 *
 * @example
 * function Header() {
 *   const { user, isLoading, signOut } = useAuth();
 *
 *   if (isLoading) return <Skeleton />;
 *   if (!user) return <LoginButton />;
 *   return <UserMenu user={user} onSignOut={signOut} />;
 * }
 */
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Create supabase client once (memoized to prevent recreations)
  const supabase = useMemo(() => createBrowserClient(), []);

  /**
   * Refresh user data from Supabase
   */
  const refreshUser = useCallback(async () => {
    if (!supabase) {
      log.debug('Supabase client not available, skipping refresh');
      setUser(null);
      return;
    }

    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();

      if (error) {
        log.debug('Auth refresh failed', { error: error.message });
        setUser(null);
        return;
      }

      setUser(currentUser);
    } catch (err) {
      log.error('Unexpected error refreshing user', {
        error: err instanceof Error ? err.message : 'Unknown error',
      });
      setUser(null);
    }
  }, [supabase]);

  /**
   * Sign out the current user
   */
  const signOut = useCallback(async () => {
    if (!supabase) {
      log.warn('Supabase client not available, cannot sign out');
      return;
    }

    try {
      log.info('Signing out user');
      const { error } = await supabase.auth.signOut();

      if (error) {
        log.error('Sign out failed', { error: error.message });
        throw error;
      }

      setUser(null);
      log.success('User signed out');

      // Redirect to home page after sign out
      window.location.href = '/';
    } catch (err) {
      log.error('Unexpected error during sign out', {
        error: err instanceof Error ? err.message : 'Unknown error',
      });
      throw err;
    }
  }, [supabase]);

  // Subscribe to auth state changes
  useEffect(() => {
    // If no supabase client (missing env vars), just show unauthenticated state
    if (!supabase) {
      log.debug('Supabase client not available, showing unauthenticated state');
      setIsLoading(false);
      return;
    }

    log.debug('Setting up auth state listener');

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
        log.debug('Initial auth state loaded', { hasUser: !!currentUser });
      } catch (err) {
        log.error('Failed to get initial auth state', {
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        log.debug('Auth state changed', { event, hasSession: !!session });

        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }

        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      log.debug('Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, [supabase]);

  return {
    user,
    isLoading,
    signOut,
    refreshUser,
  };
}
