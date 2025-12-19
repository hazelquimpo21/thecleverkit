/**
 * GOOGLE INTEGRATION
 * ===================
 * Central exports for Google OAuth and Docs API integration.
 *
 * @created 2025-12-19 - Google Docs export feature
 */

// Config
export {
  getGoogleOAuthConfig,
  buildGoogleAuthUrl,
  GOOGLE_OAUTH_SCOPES,
  GOOGLE_OAUTH_SCOPES_STRING,
} from './config';

// OAuth Client
export {
  exchangeCodeForTokens,
  refreshAccessToken,
  revokeToken,
  getValidAccessToken,
} from './client';

// Docs API
export { createGoogleDoc } from './docs';
