/**
 * GOOGLE CONNECT MODAL
 * =====================
 * Modal for connecting Google account for exports.
 * Shows when user tries to export to Google Docs without being connected.
 *
 * @created 2025-12-19 - Google Docs export feature
 */

'use client';

import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGoogleIntegration } from '@/hooks';

// ============================================================================
// TYPES
// ============================================================================

interface GoogleConnectModalProps {
  /** Whether the modal is open */
  open: boolean;

  /** Callback when modal should close */
  onOpenChange: (open: boolean) => void;

  /** Optional callback when connection succeeds */
  onConnected?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Modal to prompt user to connect their Google account.
 *
 * @example
 * <GoogleConnectModal
 *   open={showConnectModal}
 *   onOpenChange={setShowConnectModal}
 *   onConnected={() => {
 *     // Proceed with export
 *   }}
 * />
 */
export function GoogleConnectModal({
  open,
  onOpenChange,
  onConnected,
}: GoogleConnectModalProps) {
  const { connect, isConnecting, isConnected } = useGoogleIntegration();

  const handleConnect = async () => {
    try {
      await connect();
      // If we get here, connection succeeded
      onOpenChange(false);
      onConnected?.();
    } catch {
      // Error is handled by the hook
    }
  };

  // If already connected while modal is open, close and callback
  if (open && isConnected) {
    onOpenChange(false);
    onConnected?.();
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GoogleIcon className="w-5 h-5" />
            Save to Google Docs
          </DialogTitle>
          <DialogDescription>
            Connect your Google account to save documents directly to your Google Drive.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">What we&apos;ll access:</p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Create and edit Google Docs
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Access files we create (not your other files)
              </li>
            </ul>
            <p className="mt-3 text-xs">
              You can disconnect anytime from your settings.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConnecting}
          >
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <GoogleIcon className="w-4 h-4 mr-2" />
                Connect Google Account
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// GOOGLE ICON
// ============================================================================

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// Also export the Google icon for reuse
export { GoogleIcon };
