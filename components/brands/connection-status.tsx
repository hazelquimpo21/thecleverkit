/**
 * CONNECTION STATUS COMPONENT
 * ============================
 * Shows the status of the realtime connection during analysis.
 * Helps users understand why updates may be delayed.
 */

'use client';

import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ConnectionStatusProps {
  /** Whether realtime connection is active */
  isConnected: boolean;
  /** Whether using fallback polling */
  isPolling: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Shows the current connection status for realtime updates.
 *
 * @example
 * {isAnalyzing && (
 *   <ConnectionStatus isConnected={isConnected} isPolling={isPolling} />
 * )}
 */
export function ConnectionStatus({ isConnected, isPolling }: ConnectionStatusProps) {
  // Don't show if connected normally
  if (isConnected && !isPolling) {
    return (
      <div className="flex items-center gap-2 text-xs text-stone-400 px-1">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span>Live updates enabled</span>
      </div>
    );
  }

  // Show polling status
  if (isPolling) {
    return (
      <div className="flex items-center gap-2 text-xs text-stone-500 px-1">
        <RefreshCw className="w-3 h-3 animate-spin" />
        <span>Checking for updates...</span>
      </div>
    );
  }

  // Show disconnected state
  return (
    <div className="flex items-center gap-2 text-xs text-stone-400 px-1">
      <WifiOff className="w-3 h-3" />
      <span>Connecting...</span>
    </div>
  );
}
