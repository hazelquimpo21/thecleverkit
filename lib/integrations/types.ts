/**
 * INTEGRATION TYPES
 * ==================
 * Shared types for third-party integrations (Google, Notion, etc.)
 *
 * @created 2025-12-19 - Google Docs export feature
 */

// ============================================================================
// INTEGRATION PROVIDER
// ============================================================================

/**
 * Supported integration providers.
 * Add new providers here as they're implemented.
 */
export type IntegrationProvider = 'google';

// ============================================================================
// CONNECTION STATUS
// ============================================================================

/**
 * Status of a user's connection to an integration.
 */
export type IntegrationConnectionStatus = {
  /** Whether the user has connected this integration */
  isConnected: boolean;

  /** The email/account connected (if connected) */
  connectedEmail: string | null;

  /** When the connection was established (if connected) */
  connectedAt: string | null;
};

// ============================================================================
// OAUTH TYPES
// ============================================================================

/**
 * OAuth tokens returned from a provider.
 */
export type OAuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
};

/**
 * Result of an OAuth token exchange.
 */
export type OAuthExchangeResult = {
  tokens: OAuthTokens;
  email: string;
};

// ============================================================================
// GOOGLE-SPECIFIC TYPES
// ============================================================================

/**
 * Result of creating a Google Doc.
 */
export type GoogleDocCreateResult = {
  /** The Google Docs document ID */
  documentId: string;

  /** Direct URL to the document */
  documentUrl: string;

  /** Title of the created document */
  title: string;
};

/**
 * Input for creating a Google Doc.
 */
export type GoogleDocCreateInput = {
  /** Title for the new document */
  title: string;

  /** Markdown content to insert */
  markdownContent: string;

  /** Optional folder ID to create doc in */
  folderId?: string;
};
