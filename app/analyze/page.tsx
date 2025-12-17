/**
 * ANALYZE CONTINUATION PAGE
 * ==========================
 * Post-login landing page for users who were trying to analyze a brand.
 * Retrieves their saved URL and lets them continue or modify it.
 *
 * This page:
 * 1. Checks for a saved analysis intent in localStorage
 * 2. Shows the URL they wanted to analyze
 * 3. Lets them confirm or change it
 * 4. Starts analysis when they confirm
 *
 * Route: /analyze
 * This page requires authentication (handled by middleware).
 */

import { AnalyzeContinuation } from './analyze-continuation';

// ============================================================================
// PAGE METADATA
// ============================================================================

export const metadata = {
  title: 'Continue Analysis | The Clever Kit',
  description: 'Continue your brand analysis',
};

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function AnalyzePage() {
  return <AnalyzeContinuation />;
}
