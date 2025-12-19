/**
 * INTEGRATIONS MODULE
 * ====================
 * Third-party integrations (Google, Notion, etc.)
 *
 * @created 2025-12-19 - Google Docs export feature
 */

// Types
export type {
  IntegrationProvider,
  IntegrationConnectionStatus,
  OAuthTokens,
  OAuthExchangeResult,
  GoogleDocCreateResult,
  GoogleDocCreateInput,
} from './types';

// Google Integration
export * from './google';
