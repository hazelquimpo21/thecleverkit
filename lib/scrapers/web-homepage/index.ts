/**
 * WEB HOMEPAGE SCRAPER
 * =====================
 * Scrapes content from a website URL.
 *
 * This scraper:
 * 1. Fetches the HTML from the URL
 * 2. Extracts and cleans the text content
 * 3. Returns a structured result
 *
 * Usage:
 *   import { scrapeWebHomepage } from '@/lib/scrapers/web-homepage';
 *   const result = await scrapeWebHomepage('https://example.com');
 */

import { log } from '@/lib/utils/logger';
import { ensureProtocol } from '@/lib/utils/format';
import { extractTextContent } from './parser';
import type { ScrapeResult } from '../types';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SCRAPE_TIMEOUT_MS = 15000; // 15 seconds
const MAX_CONTENT_LENGTH = 50000; // ~50KB of text

const USER_AGENT =
  'Mozilla/5.0 (compatible; CleverKitBot/1.0; +https://thecleverkit.com/bot)';

// ============================================================================
// MAIN SCRAPER FUNCTION
// ============================================================================

/**
 * Scrape content from a website URL.
 *
 * @param url - The URL to scrape (protocol will be added if missing)
 * @returns Scraped content or error
 *
 * @example
 * const result = await scrapeWebHomepage('https://example.com');
 * if (result.success) {
 *   console.log(result.content);
 * }
 */
export async function scrapeWebHomepage(url: string): Promise<ScrapeResult> {
  const normalizedUrl = ensureProtocol(url);

  log.info('🌐 Starting web scrape', { url: normalizedUrl });
  const startTime = Date.now();

  try {
    // Fetch the page
    const response = await fetchWithTimeout(normalizedUrl, SCRAPE_TIMEOUT_MS);

    if (!response.ok) {
      log.error('Scrape failed - bad response', {
        status: response.status,
        statusText: response.statusText,
      });
      return {
        success: false,
        error: `Failed to fetch: ${response.status} ${response.statusText}`,
      };
    }

    // Get the HTML content
    const html = await response.text();

    if (!html || html.length === 0) {
      log.warn('Scrape returned empty content', { url: normalizedUrl });
      return {
        success: false,
        error: 'Website returned empty content',
      };
    }

    // Extract and clean text content
    const { text, title, description } = extractTextContent(html);

    if (!text || text.length < 100) {
      log.warn('Scraped content too short', { length: text?.length || 0 });
      return {
        success: false,
        error: 'Could not extract meaningful content from website',
      };
    }

    // Truncate if too long
    const finalContent = text.length > MAX_CONTENT_LENGTH
      ? text.slice(0, MAX_CONTENT_LENGTH) + '\n\n[Content truncated...]'
      : text;

    const duration = Date.now() - startTime;
    log.success('Scrape complete', {
      url: normalizedUrl,
      contentLength: finalContent.length,
      duration: `${duration}ms`,
    });

    return {
      success: true,
      content: finalContent,
      metadata: {
        title: title || undefined,
        description: description || undefined,
        url: normalizedUrl,
        scrapedAt: new Date().toISOString(),
        contentLength: finalContent.length,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // Handle specific error types
    if (message.includes('timeout') || message.includes('AbortError')) {
      log.error('Scrape timeout', { url: normalizedUrl });
      return {
        success: false,
        error: 'Website took too long to respond. Please try again.',
      };
    }

    if (message.includes('ENOTFOUND') || message.includes('getaddrinfo')) {
      log.error('Invalid domain', { url: normalizedUrl });
      return {
        success: false,
        error: 'Could not find this website. Please check the URL.',
      };
    }

    log.error('Scrape error', { url: normalizedUrl, error: message });
    return {
      success: false,
      error: `Failed to scrape website: ${message}`,
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fetch with a timeout using AbortController.
 */
async function fetchWithTimeout(
  url: string,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}
