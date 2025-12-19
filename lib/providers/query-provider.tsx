/**
 * REACT QUERY PROVIDER
 * ======================
 * Configures and provides the TanStack React Query client
 * to the entire application.
 *
 * Configuration includes:
 * - Sensible defaults for stale time and refetch behavior
 * - Error handling with toast notifications
 * - Optimized for brand analysis use case
 */

'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import { log } from '@/lib/utils/logger';

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================

/**
 * Creates a new QueryClient with sensible defaults for our app.
 *
 * Configuration rationale:
 * - staleTime: 60s - Brand data doesn't change frequently during a session
 * - gcTime: 10 min - Keep unused data in cache for quick navigation back
 * - retry: 1 - Single retry for transient failures, then fail fast
 * - refetchOnWindowFocus: false - Avoid unnecessary refetches on tab switch
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Consider data fresh for 60 seconds (reduces redundant fetches)
        staleTime: 60 * 1000,

        // Keep unused data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,

        // Retry once on failure, then give up
        retry: 1,

        // Don't refetch when window regains focus (can be noisy)
        refetchOnWindowFocus: false,

        // Don't refetch when component remounts if data is fresh
        refetchOnMount: true,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,

        // Global error handler for mutations
        onError: (error) => {
          const message = error instanceof Error ? error.message : 'An error occurred';
          log.error('Mutation error', { error: message });
          toast.error(message);
        },
      },
    },
  });
}

// ============================================================================
// SINGLETON CLIENT (for SSR)
// ============================================================================

// Browser: use a single client instance to preserve cache across navigations
// Server: create a new client for each request to avoid data leaking
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new client
    return makeQueryClient();
  } else {
    // Browser: reuse existing client or create one
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Provides React Query context to the application.
 *
 * @example
 * // In layout.tsx:
 * <QueryProvider>
 *   <Header />
 *   {children}
 * </QueryProvider>
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
