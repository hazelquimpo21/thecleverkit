/**
 * GOOGLE OAUTH ERROR PAGE
 * =========================
 * Shown when Google OAuth fails.
 * Posts error message to opener and allows manual close.
 *
 * @created 2025-12-19 - Google Docs export feature
 */

'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Error code to user-friendly message mapping
const ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'You declined to connect your Google account.',
  invalid_request: 'Invalid request. Please try again.',
  invalid_state: 'Security validation failed. Please try again.',
  state_expired: 'The connection request expired. Please try again.',
  unauthorized: 'You must be logged in to connect Google.',
  user_mismatch: 'Session mismatch. Please try again.',
  storage_failed: 'Failed to save connection. Please try again.',
  server_error: 'Something went wrong. Please try again.',
};

// Inner component that uses search params
function ErrorContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('code') || 'server_error';
  const errorMessage = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.server_error;

  useEffect(() => {
    // Post message to opener (parent window)
    if (window.opener) {
      window.opener.postMessage(
        { type: 'GOOGLE_OAUTH_ERROR', error: errorCode },
        '*'
      );
    }
  }, [errorCode]);

  const handleClose = () => {
    window.close();
  };

  return (
    <div className="text-center space-y-4 max-w-sm px-4">
      <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
        <XCircle className="w-8 h-8 text-destructive" />
      </div>
      <h1 className="text-xl font-semibold">Connection Failed</h1>
      <p className="text-muted-foreground text-sm">
        {errorMessage}
      </p>
      <Button onClick={handleClose} variant="outline" className="mt-4">
        Close Window
      </Button>
    </div>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="text-center space-y-4">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
    </div>
  );
}

// Main page component with Suspense
export default function GoogleOAuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Suspense fallback={<LoadingFallback />}>
        <ErrorContent />
      </Suspense>
    </div>
  );
}
