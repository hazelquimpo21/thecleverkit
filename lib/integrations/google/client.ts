/**
 * GOOGLE OAUTH CLIENT
 * ====================
 * Token management for Google OAuth.
 * Handles token exchange, refresh, and revocation.
 *
 * @created 2025-12-19 - Google Docs export feature
 */

import { log } from '@/lib/utils/logger';
import {
  getGoogleOAuthConfig,
  GOOGLE_TOKEN_URL,
  GOOGLE_REVOKE_URL,
  GOOGLE_USERINFO_URL,
} from './config';
import type { OAuthTokens, OAuthExchangeResult } from '../types';

// ============================================================================
// TOKEN EXCHANGE
// ============================================================================

/**
 * Exchange an authorization code for tokens.
 * Called after user completes OAuth flow.
 *
 * @param code - Authorization code from Google callback
 * @returns Access token, refresh token, and user email
 */
export async function exchangeCodeForTokens(code: string): Promise<OAuthExchangeResult> {
  const config = getGoogleOAuthConfig();

  log.info('🔐 Exchanging auth code for tokens');

  // Exchange code for tokens
  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.text();
    log.error('Token exchange failed', { status: tokenResponse.status, error: errorData });
    throw new Error('Failed to exchange authorization code');
  }

  const tokenData = await tokenResponse.json();

  if (!tokenData.access_token || !tokenData.refresh_token) {
    log.error('Missing tokens in response', { hasAccess: !!tokenData.access_token, hasRefresh: !!tokenData.refresh_token });
    throw new Error('Invalid token response from Google');
  }

  // Get user email
  const email = await fetchUserEmail(tokenData.access_token);

  const tokens: OAuthTokens = {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt: Date.now() + (tokenData.expires_in * 1000),
  };

  log.success('🔐 Token exchange successful', { email });

  return { tokens, email };
}

// ============================================================================
// TOKEN REFRESH
// ============================================================================

/**
 * Refresh an access token using a refresh token.
 *
 * @param refreshToken - The stored refresh token
 * @returns Fresh access token and expiry
 */
export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: number }> {
  const config = getGoogleOAuthConfig();

  log.info('🔄 Refreshing Google access token');

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    log.error('Token refresh failed', { status: response.status, error: errorData });
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();

  if (!data.access_token) {
    throw new Error('No access token in refresh response');
  }

  log.success('🔄 Token refreshed successfully');

  return {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };
}

// ============================================================================
// TOKEN REVOCATION
// ============================================================================

/**
 * Revoke a refresh token (disconnect integration).
 * Called when user wants to disconnect their Google account.
 *
 * @param refreshToken - The refresh token to revoke
 */
export async function revokeToken(refreshToken: string): Promise<void> {
  log.info('🔓 Revoking Google token');

  const response = await fetch(`${GOOGLE_REVOKE_URL}?token=${refreshToken}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  // Google returns 200 on success, but also if token is already revoked
  // We treat both as success
  if (!response.ok && response.status !== 400) {
    log.warn('Token revocation returned non-200', { status: response.status });
  }

  log.success('🔓 Token revoked successfully');
}

// ============================================================================
// USER INFO
// ============================================================================

/**
 * Fetch user's email from Google.
 *
 * @param accessToken - Valid access token
 * @returns User's Google email
 */
async function fetchUserEmail(accessToken: string): Promise<string> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    log.error('Failed to fetch user info', { status: response.status });
    throw new Error('Failed to get user email from Google');
  }

  const data = await response.json();

  if (!data.email) {
    throw new Error('No email in user info response');
  }

  return data.email;
}

// ============================================================================
// HELPER: GET VALID ACCESS TOKEN
// ============================================================================

/**
 * Get a valid access token, refreshing if necessary.
 * This is the main function to call before making Google API requests.
 *
 * @param refreshToken - The stored refresh token
 * @returns Valid access token
 */
export async function getValidAccessToken(refreshToken: string): Promise<string> {
  // Always refresh to get a fresh token
  // In a production app, you might cache the access token and check expiry
  const { accessToken } = await refreshAccessToken(refreshToken);
  return accessToken;
}
