/**
 * GOLDEN CIRCLE RENDERER
 * =======================
 * Converts parsed Golden Circle content to markdown for export.
 *
 * Output format matches the spec in 12-DOCS_FEATURE.md:
 * - Title with brand name
 * - Why/How/What sections with headlines and explanations
 * - Summary in italics
 * - Generated timestamp
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

import type { GoldenCircleContent } from './types';

// ============================================================================
// MARKDOWN RENDERER
// ============================================================================

/**
 * Render Golden Circle content as markdown.
 *
 * @param content - Parsed Golden Circle content
 * @param brandName - The brand's display name
 * @returns Formatted markdown string
 *
 * @example
 * const markdown = renderMarkdown(content, 'Acme Corp');
 * // # Golden Circle: Acme Corp
 * // ## Why
 * // **They believe everyone deserves great products.**
 * // ...
 */
export function renderMarkdown(
  content: GoldenCircleContent,
  brandName: string
): string {
  const { why, how, what, summary } = content;

  // Build markdown sections
  const sections = [
    // Title
    `# Golden Circle: ${brandName}`,
    '',

    // Why section
    '## Why',
    `**${why.headline}**`,
    '',
    why.explanation,
    '',

    // How section
    '## How',
    `**${how.headline}**`,
    '',
    how.explanation,
    '',

    // What section
    '## What',
    `**${what.headline}**`,
    '',
    what.explanation,
    '',

    // Divider before summary
    '---',
    '',

    // Summary in italics
    `*${summary}*`,
    '',

    // Footer with generation info
    '---',
    '',
    `*Generated with The Clever Kit on ${formatDate(new Date())}*`,
  ];

  return sections.join('\n');
}

// ============================================================================
// TITLE GENERATOR
// ============================================================================

/**
 * Generate the document title from brand data.
 *
 * @param brandData - Brand data with name
 * @returns Document title string
 */
export function generateTitle(brandData: { brandName: string }): string {
  return `Golden Circle: ${brandData.brandName}`;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Format a date for display in markdown footer.
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
