/**
 * GOOGLE OAUTH SUCCESS PAGE
 * ===========================
 * Shown after successful Google OAuth.
 * Notifies the opener window and closes itself.
 *
 * Uses multiple methods to ensure communication works:
 * 1. postMessage (preferred, but blocked by COOP)
 * 2. localStorage event (fallback, works cross-origin)
 *
 * @created 2025-12-19 - Google Docs export feature
 */

'use client';

import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function GoogleOAuthSuccessPage() {
  useEffect(() => {
    // Method 1: Try postMessage (works if COOP is same-origin-allow-popups)
    if (window.opener) {
      try {
        window.opener.postMessage({ type: 'GOOGLE_OAUTH_SUCCESS' }, window.location.origin);
      } catch {
        // COOP might block this, use fallback
      }
    }

    // Method 2: Use localStorage for cross-tab communication (always works)
    // The parent window listens for storage events
    localStorage.setItem('google_oauth_result', JSON.stringify({
      type: 'success',
      timestamp: Date.now(),
    }));

    // Close this popup after a short delay
    setTimeout(() => window.close(), 1500);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <h1 className="text-xl font-semibold">Google Connected!</h1>
        <p className="text-muted-foreground text-sm">
          This window will close automatically...
        </p>
      </div>
    </div>
  );
}
