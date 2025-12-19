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

      // Wait for popup to post message
      return new Promise((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {
          // Verify origin in production
          if (event.data?.type === 'GOOGLE_OAUTH_SUCCESS') {
            window.removeEventListener('message', handleMessage);
            log.success('🔗 Google: Connection successful');
            resolve();
          } else if (event.data?.type === 'GOOGLE_OAUTH_ERROR') {
            window.removeEventListener('message', handleMessage);
            log.error('🔗 Google: Connection failed', { error: event.data.error });
            reject(new Error('Google connection failed'));
          }
        };

        window.addEventListener('message', handleMessage);

        // Also check if popup was closed without completing
        const checkClosed = setInterval(() => {
          if (oauthPopupRef.current?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            // Don't reject - user might have just closed the popup
            log.warn('🔗 Google: Popup closed');
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
