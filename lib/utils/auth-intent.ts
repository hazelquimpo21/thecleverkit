/**
 * AUTH INTENT UTILITIES
 * ======================
 * Utilities for preserving user intent across authentication flows.
 * When a user tries to perform an action that requires auth (like analyzing a brand),
 * we save their intent so we can resume after they sign in.
 *
 * Usage:
 *   // Before redirecting to login
 *   saveAnalysisIntent({ url: 'https://example.com' });
 *
 *   // After login, check for pending intent
 *   const intent = getAnalysisIntent();
 *   if (intent) {
 *     // Resume the analysis
 *     clearAnalysisIntent();
 *   }
 */

import { log } from './logger';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Intent to analyze a brand, saved when user isn't authenticated
 */
export interface AnalysisIntent {
  /** The URL the user wanted to analyze */
  url: string;
  /** Whether this is the user's own brand */
  isOwnBrand?: boolean;
  /** When the intent was saved (Unix timestamp) */
  savedAt: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** LocalStorage key for analysis intent */
const STORAGE_KEY = 'clever_kit_analysis_intent';

/** Intent expires after 30 minutes (in milliseconds) */
const INTENT_EXPIRY_MS = 30 * 60 * 1000;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if localStorage is available (handles SSR and private browsing)
 */
function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if an intent has expired
 */
function isIntentExpired(intent: AnalysisIntent): boolean {
  const now = Date.now();
  const age = now - intent.savedAt;
  return age > INTENT_EXPIRY_MS;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Save an analysis intent to localStorage.
 * Call this before redirecting to login when user tries to analyze without auth.
 *
 * @param params - The analysis parameters to save
 * @returns true if saved successfully, false otherwise
 *
 * @example
 * saveAnalysisIntent({ url: 'https://example.com', isOwnBrand: true });
 */
export function saveAnalysisIntent(params: {
  url: string;
  isOwnBrand?: boolean;
}): boolean {
  if (!isStorageAvailable()) {
    log.warn('Cannot save analysis intent: localStorage not available');
    return false;
  }

  const intent: AnalysisIntent = {
    url: params.url,
    isOwnBrand: params.isOwnBrand,
    savedAt: Date.now(),
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
    log.debug('Analysis intent saved', { url: params.url });
    return true;
  } catch (error) {
    log.error('Failed to save analysis intent', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

/**
 * Retrieve a saved analysis intent from localStorage.
 * Returns null if no intent exists or if it has expired.
 *
 * @returns The saved intent or null
 *
 * @example
 * const intent = getAnalysisIntent();
 * if (intent) {
 *   console.log(`User wanted to analyze: ${intent.url}`);
 * }
 */
export function getAnalysisIntent(): AnalysisIntent | null {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const intent = JSON.parse(stored) as AnalysisIntent;

    // Check if intent has expired
    if (isIntentExpired(intent)) {
      log.debug('Analysis intent expired, clearing');
      clearAnalysisIntent();
      return null;
    }

    log.debug('Analysis intent retrieved', { url: intent.url });
    return intent;
  } catch (error) {
    log.error('Failed to retrieve analysis intent', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    // Clear corrupted data
    clearAnalysisIntent();
    return null;
  }
}

/**
 * Clear any saved analysis intent.
 * Call this after successfully using the intent or when user cancels.
 *
 * @example
 * // After analysis starts successfully
 * clearAnalysisIntent();
 */
export function clearAnalysisIntent(): void {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    log.debug('Analysis intent cleared');
  } catch (error) {
    log.error('Failed to clear analysis intent', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Check if there's a valid (non-expired) analysis intent saved.
 * Useful for showing UI hints without loading the full intent.
 *
 * @returns true if there's a valid intent
 */
export function hasAnalysisIntent(): boolean {
  return getAnalysisIntent() !== null;
}

/**
 * Get the URL from a saved intent, or null if none exists.
 * Convenience method for quick checks.
 *
 * @returns The saved URL or null
 */
export function getIntentUrl(): string | null {
  const intent = getAnalysisIntent();
  return intent?.url ?? null;
}
