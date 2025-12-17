/**
 * FORMAT UTILITIES
 * =================
 * Helper functions for formatting data for display.
 * Dates, URLs, text truncation, etc.
 */

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format a date string to a readable format.
 *
 * @param dateString - ISO date string
 * @returns Formatted date like "Jan 15, 2024"
 *
 * @example
 * formatDate('2024-01-15T10:30:00Z') // -> 'Jan 15, 2024'
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';

  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format a date to relative time (e.g., "2 hours ago").
 *
 * @param dateString - ISO date string
 * @returns Relative time string
 *
 * @example
 * formatRelativeTime('2024-01-15T10:30:00Z') // -> '2 days ago'
 */
export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return formatDate(dateString);
  } catch {
    return 'N/A';
  }
}

// ============================================================================
// URL FORMATTING
// ============================================================================

/**
 * Extract the domain from a URL for display.
 *
 * @param url - Full URL
 * @returns Domain without protocol (e.g., "example.com")
 *
 * @example
 * extractDomain('https://www.example.com/page') // -> 'example.com'
 */
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove 'www.' prefix if present
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Ensure a URL has a protocol (adds https:// if missing).
 *
 * @param url - URL that might be missing protocol
 * @returns URL with protocol
 *
 * @example
 * ensureProtocol('example.com') // -> 'https://example.com'
 * ensureProtocol('https://example.com') // -> 'https://example.com'
 */
export function ensureProtocol(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Validate if a string is a valid URL.
 *
 * @param url - String to validate
 * @returns True if valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(ensureProtocol(url));
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// ============================================================================
// TEXT FORMATTING
// ============================================================================

/**
 * Truncate text to a maximum length with ellipsis.
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncating
 * @returns Truncated text with "..." if needed
 *
 * @example
 * truncate('Hello world', 5) // -> 'Hello...'
 */
export function truncate(text: string | null, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

/**
 * Capitalize the first letter of a string.
 *
 * @param text - Text to capitalize
 * @returns Text with first letter capitalized
 *
 * @example
 * capitalize('hello') // -> 'Hello'
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert a string to title case.
 *
 * @param text - Text to convert
 * @returns Text in Title Case
 *
 * @example
 * titleCase('hello world') // -> 'Hello World'
 */
export function titleCase(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Format a number with commas for readability.
 *
 * @param num - Number to format
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234567) // -> '1,234,567'
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Format bytes to human-readable size.
 *
 * @param bytes - Number of bytes
 * @returns Formatted size string
 *
 * @example
 * formatBytes(1024) // -> '1 KB'
 * formatBytes(1048576) // -> '1 MB'
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
