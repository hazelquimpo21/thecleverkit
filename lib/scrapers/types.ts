/**
 * SCRAPER TYPES
 * ==============
 * Shared types for all scraper modules.
 */

// ============================================================================
// SCRAPER CONFIG
// ============================================================================

export type ScraperType = 'web-homepage';

export interface ScraperConfig {
  id: ScraperType;
  name: string;
  description: string;
}

// ============================================================================
// SCRAPER RESULT
// ============================================================================

export interface ScrapeResult {
  success: boolean;
  content?: string;
  error?: string;
  metadata?: {
    title?: string;
    description?: string;
    url: string;
    scrapedAt: string;
    contentLength: number;
  };
}
