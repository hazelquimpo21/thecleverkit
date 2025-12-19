/**
 * USE GOOGLE INTEGRATION
 * =======================
 * React hook for managing Google OAuth integration.
 * Handles connection status, connect/disconnect flows, and export to Google Docs.
 *
 * @created 2025-12-19 - Google Docs export feature
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/sonner';
import { log } from '@/lib/utils/logger';
import type { IntegrationConnectionStatus } from '@/lib/integrations/types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const googleIntegrationKeys = {
  all: ['google-integration'] as const,
  status: () => [...googleIntegrationKeys.all, 'status'] as const,
};

// ============================================================================
// FETCH STATUS
// ============================================================================

async function fetchGoogleStatus(): Promise<IntegrationConnectionStatus> {
  const response = await fetch('/api/integrations/google/status');

  if (!response.ok) {
    if (response.status === 401) {
      // Not authenticated, return disconnected status
      return { isConnected: false, connectedEmail: null, connectedAt: null };
    }
    throw new Error('Failed to fetch Google status');
  }

  return response.json();
}

// ============================================================================
// HOOK
// ============================================================================

export function useGoogleIntegration() {
  const queryClient = useQueryClient();
  const oauthPopupRef = useRef<Window | null>(null);

  // ============================================================================
  // STATUS QUERY
  // ============================================================================

  const statusQuery = useQuery({
    queryKey: googleIntegrationKeys.status(),
    queryFn: fetchGoogleStatus,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });

  // ============================================================================
  // CONNECT MUTATION
  // ============================================================================

  const connectMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      log.info('🔗 Google: Initiating connection');

      // Clear any previous OAuth result from localStorage
      localStorage.removeItem('google_oauth_result');

      // Get auth URL from API
      const response = await fetch('/api/integrations/google/auth', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to initiate Google OAuth');
      }

      const { authUrl } = await response.json();

      // Open OAuth popup
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;

      oauthPopupRef.current = window.open(
        authUrl,
        'google-oauth',
        `width=${width},height=${height},left=${left},top=${top},popup=1`
      );

      if (!oauthPopupRef.current) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Wait for popup to complete via postMessage OR localStorage
      return new Promise((resolve, reject) => {
        let resolved = false;
        let checkClosedInterval: ReturnType<typeof setInterval>;

        const cleanup = () => {
          resolved = true;
          window.removeEventListener('message', handleMessage);
          window.removeEventListener('storage', handleStorage);
          if (checkClosedInterval) clearInterval(checkClosedInterval);
        };

        // Method 1: Listen for postMessage (preferred)
        const handleMessage = (event: MessageEvent) => {
          if (resolved) return;
          // Verify origin
          if (event.origin !== window.location.origin) return;

          if (event.data?.type === 'GOOGLE_OAUTH_SUCCESS') {
            cleanup();
            log.success('🔗 Google: Connection successful (postMessage)');
            resolve();
          } else if (event.data?.type === 'GOOGLE_OAUTH_ERROR') {
            cleanup();
            log.error('🔗 Google: Connection failed', { error: event.data.error });
            reject(new Error(event.data.error || 'Google connection failed'));
          }
        };

        // Method 2: Listen for localStorage changes (fallback for COOP issues)
        const handleStorage = (event: StorageEvent) => {
          if (resolved) return;
          if (event.key !== 'google_oauth_result') return;

          try {
            const result = JSON.parse(event.newValue || '{}');
            // Only process recent results (within 30 seconds)
            if (Date.now() - result.timestamp > 30000) return;

            if (result.type === 'success') {
              cleanup();
              log.success('🔗 Google: Connection successful (localStorage)');
              localStorage.removeItem('google_oauth_result');
              resolve();
            } else if (result.type === 'error') {
              cleanup();
              log.error('🔗 Google: Connection failed', { error: result.error });
              localStorage.removeItem('google_oauth_result');
              reject(new Error(result.error || 'Google connection failed'));
            }
          } catch {
            // Ignore parse errors
          }
        };

        window.addEventListener('message', handleMessage);
        window.addEventListener('storage', handleStorage);

        // Also poll localStorage in case storage event doesn't fire (same tab)
        checkClosedInterval = setInterval(() => {
          if (resolved) return;

          // Check localStorage directly as backup
          try {
            const stored = localStorage.getItem('google_oauth_result');
            if (stored) {
              const result = JSON.parse(stored);
              if (Date.now() - result.timestamp < 30000) {
                if (result.type === 'success') {
                  cleanup();
                  log.success('🔗 Google: Connection successful (localStorage poll)');
                  localStorage.removeItem('google_oauth_result');
                  resolve();
                  return;
                } else if (result.type === 'error') {
                  cleanup();
                  log.error('🔗 Google: Connection failed', { error: result.error });
                  localStorage.removeItem('google_oauth_result');
                  reject(new Error(result.error || 'Google connection failed'));
                  return;
                }
              }
            }
          } catch {
            // Ignore parse errors
          }

          // Check if popup was closed without completing (with COOP-safe try/catch)
          try {
            if (oauthPopupRef.current?.closed) {
              // Wait a bit more in case localStorage update is pending
              setTimeout(() => {
                if (resolved) return;
                cleanup();
                log.warn('🔗 Google: Popup closed without completing');
                // Don't reject, resolve - status query will update
                resolve();
              }, 500);
            }
          } catch {
            // COOP blocks window.closed access - rely on localStorage/postMessage
          }
        }, 1000);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: googleIntegrationKeys.status() });
      toast.success('Google account connected!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to connect Google');
    },
  });

  // ============================================================================
  // DISCONNECT MUTATION
  // ============================================================================

  const disconnectMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      log.info('🔓 Google: Disconnecting');

      const response = await fetch('/api/integrations/google/disconnect', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to disconnect');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: googleIntegrationKeys.status() });
      toast.success('Google account disconnected');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to disconnect');
    },
  });

  // ============================================================================
  // EXPORT MUTATION
  // ============================================================================

  const exportMutation = useMutation({
    mutationFn: async (docId: string): Promise<{ googleDocUrl: string }> => {
      log.info('📤 Google Docs: Exporting', { docId });

      const response = await fetch('/api/export/google-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        if (data.code === 'GOOGLE_NOT_CONNECTED') {
          throw new Error('Please connect your Google account first');
        }
        if (data.code === 'GOOGLE_TOKEN_EXPIRED') {
          // Invalidate status so UI updates
          queryClient.invalidateQueries({ queryKey: googleIntegrationKeys.status() });
          throw new Error('Google connection expired. Please reconnect.');
        }
        throw new Error(data.error || 'Export failed');
      }

      return { googleDocUrl: data.googleDocUrl };
    },
    onSuccess: (data) => {
      toast.success('Saved to Google Docs!', {
        action: {
          label: 'Open',
          onClick: () => window.open(data.googleDocUrl, '_blank'),
        },
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Export failed');
    },
  });

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      // Close popup if component unmounts
      if (oauthPopupRef.current && !oauthPopupRef.current.closed) {
        oauthPopupRef.current.close();
      }
    };
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Status
    isConnected: statusQuery.data?.isConnected ?? false,
    connectedEmail: statusQuery.data?.connectedEmail ?? null,
    connectedAt: statusQuery.data?.connectedAt ?? null,
    isLoading: statusQuery.isLoading,
    statusError: statusQuery.error,

    // Connect
    connect: connectMutation.mutate,
    connectAsync: connectMutation.mutateAsync,
    isConnecting: connectMutation.isPending,

    // Disconnect
    disconnect: disconnectMutation.mutate,
    disconnectAsync: disconnectMutation.mutateAsync,
    isDisconnecting: disconnectMutation.isPending,

    // Export
    exportToGoogleDocs: exportMutation.mutate,
    exportToGoogleDocsAsync: exportMutation.mutateAsync,
    isExporting: exportMutation.isPending,

    // Refetch status
    refetchStatus: useCallback(() => {
      return queryClient.invalidateQueries({ queryKey: googleIntegrationKeys.status() });
    }, [queryClient]),
  };
}
