/**
 * GOOGLE DOCS API
 * ================
 * Wrapper for Google Docs API operations.
 * Creates and updates Google Docs with content.
 *
 * @created 2025-12-19 - Google Docs export feature
 */

import { log } from '@/lib/utils/logger';
import { GOOGLE_DOCS_API_URL } from './config';
import type { GoogleDocCreateInput, GoogleDocCreateResult } from '../types';

// ============================================================================
// CREATE DOCUMENT
// ============================================================================

/**
 * Create a new Google Doc with the given content.
 *
 * Process:
 * 1. Create a blank document with the title
 * 2. Insert the content using batchUpdate
 *
 * @param accessToken - Valid Google access token
 * @param input - Title and markdown content
 * @returns Document ID and URL
 */
export async function createGoogleDoc(
  accessToken: string,
  input: GoogleDocCreateInput
): Promise<GoogleDocCreateResult> {
  log.info('📄 Creating Google Doc', { title: input.title });

  // Step 1: Create a blank document
  const createResponse = await fetch(GOOGLE_DOCS_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: input.title,
    }),
  });

  if (!createResponse.ok) {
    const errorData = await createResponse.text();
    log.error('Failed to create Google Doc', { status: createResponse.status, error: errorData });
    throw new Error('Failed to create Google Doc');
  }

  const docData = await createResponse.json();
  const documentId = docData.documentId;

  if (!documentId) {
    throw new Error('No document ID returned from Google');
  }

  log.info('📄 Blank doc created', { documentId });

  // Step 2: Insert content
  await insertDocContent(accessToken, documentId, input.markdownContent);

  // Build the document URL
  const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

  log.success('📄 Google Doc created successfully', { documentId, title: input.title });

  return {
    documentId,
    documentUrl,
    title: input.title,
  };
}

// ============================================================================
// INSERT CONTENT
// ============================================================================

/**
 * Insert content into an existing Google Doc.
 * Converts markdown to Google Docs format using batchUpdate.
 *
 * @param accessToken - Valid Google access token
 * @param documentId - The document to update
 * @param markdownContent - Markdown content to insert
 */
async function insertDocContent(
  accessToken: string,
  documentId: string,
  markdownContent: string
): Promise<void> {
  log.info('📝 Inserting content into Google Doc');

  // Convert markdown to Google Docs requests
  const requests = markdownToDocRequests(markdownContent);

  if (requests.length === 0) {
    log.warn('No content to insert');
    return;
  }

  const batchUpdateUrl = `${GOOGLE_DOCS_API_URL}/${documentId}:batchUpdate`;

  const response = await fetch(batchUpdateUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    log.error('Failed to insert content', { status: response.status, error: errorData });
    throw new Error('Failed to insert content into Google Doc');
  }

  log.success('📝 Content inserted successfully');
}

// ============================================================================
// MARKDOWN TO DOCS CONVERSION
// ============================================================================

/**
 * Convert markdown to Google Docs batchUpdate requests.
 *
 * Handles:
 * - Headers (# ## ###)
 * - Bold (**text**)
 * - Italic (*text*)
 * - Horizontal rules (---)
 * - Paragraphs
 *
 * Note: Google Docs API inserts content at index 1 (after the implicit newline).
 * We build requests in reverse order so indices work correctly.
 */
function markdownToDocRequests(markdown: string): GoogleDocsRequest[] {
  const requests: GoogleDocsRequest[] = [];
  const lines = markdown.split('\n');

  // We'll build a flat text and then apply formatting
  // This is simpler and more reliable than trying to insert formatted segments

  // First pass: convert markdown to plain text with markers
  let plainText = '';
  const formatRanges: FormatRange[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      plainText += '\n';
      continue;
    }

    // Check for horizontal rule
    if (trimmed === '---') {
      plainText += '────────────────────\n\n';
      continue;
    }

    // Check for headers
    const h1Match = trimmed.match(/^# (.+)$/);
    const h2Match = trimmed.match(/^## (.+)$/);
    const h3Match = trimmed.match(/^### (.+)$/);

    if (h1Match) {
      const startIndex = plainText.length;
      const text = h1Match[1] + '\n\n';
      plainText += text;
      formatRanges.push({
        start: startIndex,
        end: startIndex + text.length - 2, // Exclude trailing newlines
        style: 'HEADING_1',
      });
      continue;
    }

    if (h2Match) {
      const startIndex = plainText.length;
      const text = h2Match[1] + '\n\n';
      plainText += text;
      formatRanges.push({
        start: startIndex,
        end: startIndex + text.length - 2,
        style: 'HEADING_2',
      });
      continue;
    }

    if (h3Match) {
      const startIndex = plainText.length;
      const text = h3Match[1] + '\n\n';
      plainText += text;
      formatRanges.push({
        start: startIndex,
        end: startIndex + text.length - 2,
        style: 'HEADING_3',
      });
      continue;
    }

    // Regular paragraph - handle bold and italic
    let processed = trimmed;
    const lineStart = plainText.length;

    // Find bold segments
    const boldRegex = /\*\*(.+?)\*\*/g;
    let boldMatch;
    let offsetAdjust = 0;

    while ((boldMatch = boldRegex.exec(trimmed)) !== null) {
      const textStart = lineStart + boldMatch.index - offsetAdjust;
      const textEnd = textStart + boldMatch[1].length;
      formatRanges.push({
        start: textStart,
        end: textEnd,
        style: 'BOLD',
      });
      // Account for removed ** markers
      offsetAdjust += 4;
    }

    // Remove markdown markers for plain text
    processed = processed.replace(/\*\*(.+?)\*\*/g, '$1');
    processed = processed.replace(/\*(.+?)\*/g, '$1');

    plainText += processed + '\n\n';
  }

  // Trim trailing whitespace but keep one newline
  plainText = plainText.trimEnd() + '\n';

  // Now build the requests
  // 1. Insert the plain text
  requests.push({
    insertText: {
      location: { index: 1 },
      text: plainText,
    },
  });

  // 2. Apply formatting (in reverse order to preserve indices)
  const sortedRanges = [...formatRanges].sort((a, b) => b.start - a.start);

  for (const range of sortedRanges) {
    if (range.style === 'HEADING_1' || range.style === 'HEADING_2' || range.style === 'HEADING_3') {
      requests.push({
        updateParagraphStyle: {
          range: {
            startIndex: range.start + 1, // +1 because doc index starts at 1
            endIndex: range.end + 1,
          },
          paragraphStyle: {
            namedStyleType: range.style,
          },
          fields: 'namedStyleType',
        },
      });
    } else if (range.style === 'BOLD') {
      requests.push({
        updateTextStyle: {
          range: {
            startIndex: range.start + 1,
            endIndex: range.end + 1,
          },
          textStyle: {
            bold: true,
          },
          fields: 'bold',
        },
      });
    }
  }

  return requests;
}

// ============================================================================
// TYPES
// ============================================================================

interface FormatRange {
  start: number;
  end: number;
  style: 'HEADING_1' | 'HEADING_2' | 'HEADING_3' | 'BOLD' | 'ITALIC';
}

// Google Docs API request types (simplified)
type GoogleDocsRequest =
  | { insertText: { location: { index: number }; text: string } }
  | {
      updateParagraphStyle: {
        range: { startIndex: number; endIndex: number };
        paragraphStyle: { namedStyleType: string };
        fields: string;
      };
    }
  | {
      updateTextStyle: {
        range: { startIndex: number; endIndex: number };
        textStyle: { bold?: boolean; italic?: boolean };
        fields: string;
      };
    };
