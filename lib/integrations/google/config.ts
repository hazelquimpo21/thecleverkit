/**
 * GOOGLE INTEGRATION CONFIG
 * ==========================
 * OAuth configuration and scopes for Google integration.
 *
 * Environment Variables Required:
 *   GOOGLE_CLIENT_ID - Google OAuth client ID
 *   GOOGLE_CLIENT_SECRET - Google OAuth client secret
 *   GOOGLE_REDIRECT_URI - OAuth callback URL
 *
 * @created 2025-12-19 - Google Docs export feature
 */

import { log } from '@/lib/utils/logger';

// ============================================================================
// OAUTH CONFIG
// ============================================================================

/**
 * Google OAuth configuration.
 * Reads from environment variables at runtime.
 */
export function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  // Validate required env vars
  if (!clientId || !clientSecret || !redirectUri) {
    log.error('Missing Google OAuth environment variables', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasRedirectUri: !!redirectUri,
    });
    throw new Error('Google OAuth not configured. Check environment variables.');
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
  };
}

// ============================================================================
// SCOPES
// ============================================================================

/**
 * OAuth scopes we request from Google.
 * Keep these minimal - only what we need.
 *
 * - documents: Create and edit Google Docs
 * - drive.file: Access files created by this app (not all Drive files)
 *
 * Neither of these are "sensitive scopes", so verification is easier.
 */
export const GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive.file',
  'email', // To get the user's email for display
] as const;

/**
 * Scopes as a space-separated string (for OAuth URL).
 */
export const GOOGLE_OAUTH_SCOPES_STRING = GOOGLE_OAUTH_SCOPES.join(' ');

// ============================================================================
// OAUTH URLS
// ============================================================================

/**
 * Google OAuth authorization URL.
 */
export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

/**
 * Google OAuth token exchange URL.
 */
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

/**
 * Google OAuth token revocation URL.
 */
export const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';

/**
 * Google userinfo URL (to get email).
 */
export const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// ============================================================================
// API URLS
// ============================================================================

/**
 * Google Docs API base URL.
 */
export const GOOGLE_DOCS_API_URL = 'https://docs.googleapis.com/v1/documents';

// ============================================================================
// BUILD AUTH URL
// ============================================================================

/**
 * Build the Google OAuth authorization URL.
 *
 * @param state - State parameter for CSRF protection (should include user ID)
 */
export function buildGoogleAuthUrl(state: string): string {
  const config = getGoogleOAuthConfig();

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: GOOGLE_OAUTH_SCOPES_STRING,
    access_type: 'offline', // Get refresh token
    prompt: 'consent', // Always show consent (ensures we get refresh token)
    state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}
