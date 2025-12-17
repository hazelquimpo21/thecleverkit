/**
 * WEB CONTENT PARSER
 * ===================
 * Extracts and cleans text content from HTML.
 *
 * This parser:
 * - Removes script, style, and other non-content tags
 * - Extracts the main text content
 * - Cleans up whitespace and formatting
 * - Extracts metadata (title, description)
 */

// ============================================================================
// TYPES
// ============================================================================

interface ExtractedContent {
  text: string;
  title: string | null;
  description: string | null;
}

// ============================================================================
// MAIN EXTRACTION FUNCTION
// ============================================================================

/**
 * Extract clean text content from HTML.
 *
 * @param html - Raw HTML string
 * @returns Extracted text and metadata
 */
export function extractTextContent(html: string): ExtractedContent {
  // Extract metadata first (before cleaning)
  const title = extractTitle(html);
  const description = extractMetaDescription(html);

  // Remove non-content elements
  let cleaned = html;

  // Remove script tags and their content
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');

  // Remove style tags and their content
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');

  // Remove comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, ' ');

  // Remove SVG elements
  cleaned = cleaned.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ');

  // Remove noscript elements
  cleaned = cleaned.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ');

  // Remove header and footer (often navigation/boilerplate)
  // We keep them but they'll be de-prioritized by the AI
  cleaned = cleaned.replace(/<header\b[^>]*>([\s\S]*?)<\/header>/gi, '\n$1\n');
  cleaned = cleaned.replace(/<footer\b[^>]*>([\s\S]*?)<\/footer>/gi, '\n$1\n');

  // Remove nav elements
  cleaned = cleaned.replace(/<nav\b[^>]*>([\s\S]*?)<\/nav>/gi, ' ');

  // Add newlines for block elements
  cleaned = cleaned.replace(/<\/(h[1-6]|p|div|section|article|li|tr)>/gi, '\n');
  cleaned = cleaned.replace(/<(h[1-6]|p|div|section|article)[^>]*>/gi, '\n');

  // Add space for inline breaks
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n');
  cleaned = cleaned.replace(/<hr\s*\/?>/gi, '\n---\n');

  // Remove all remaining HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  cleaned = decodeHtmlEntities(cleaned);

  // Clean up whitespace
  cleaned = cleanWhitespace(cleaned);

  return {
    text: cleaned,
    title,
    description,
  };
}

// ============================================================================
// METADATA EXTRACTION
// ============================================================================

/**
 * Extract the page title from HTML.
 */
function extractTitle(html: string): string | null {
  // Try <title> tag
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].trim();
  }

  // Try og:title meta tag
  const ogTitleMatch = html.match(
    /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i
  );
  if (ogTitleMatch && ogTitleMatch[1]) {
    return ogTitleMatch[1].trim();
  }

  return null;
}

/**
 * Extract the meta description from HTML.
 */
function extractMetaDescription(html: string): string | null {
  // Try standard meta description
  const descMatch = html.match(
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
  );
  if (descMatch && descMatch[1]) {
    return descMatch[1].trim();
  }

  // Try og:description
  const ogDescMatch = html.match(
    /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i
  );
  if (ogDescMatch && ogDescMatch[1]) {
    return ogDescMatch[1].trim();
  }

  return null;
}

// ============================================================================
// CLEANING UTILITIES
// ============================================================================

/**
 * Decode common HTML entities.
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&copy;': '(c)',
    '&reg;': '(R)',
    '&trade;': '(TM)',
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '...',
    '&bull;': '•',
    '&rsquo;': "'",
    '&lsquo;': "'",
    '&rdquo;': '"',
    '&ldquo;': '"',
  };

  let result = text;
  for (const [entity, replacement] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, 'gi'), replacement);
  }

  // Handle numeric entities
  result = result.replace(/&#(\d+);/g, (_, num) =>
    String.fromCharCode(parseInt(num, 10))
  );
  result = result.replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );

  return result;
}

/**
 * Clean up whitespace in text.
 */
function cleanWhitespace(text: string): string {
  return text
    // Replace multiple spaces with single space
    .replace(/[ \t]+/g, ' ')
    // Replace multiple newlines with double newline
    .replace(/\n{3,}/g, '\n\n')
    // Remove leading/trailing whitespace from lines
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Remove empty lines at start and end
    .trim();
}
