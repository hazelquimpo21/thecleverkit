/**
 * DOC EXPORT MENU
 * =================
 * Dropdown menu for exporting generated docs.
 * Supports copy to clipboard and PDF download.
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

'use client';

import { Copy, Download, ChevronDown, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/sonner';
import { log } from '@/lib/utils/logger';

// ============================================================================
// TYPES
// ============================================================================

interface DocExportMenuProps {
  /** Markdown content to export */
  markdown: string;

  /** Document title for PDF filename */
  title: string;

  /** Optional: custom trigger button */
  trigger?: React.ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Dropdown menu with export options for a doc.
 *
 * @example
 * <DocExportMenu markdown={doc.content_markdown} title={doc.title} />
 */
export function DocExportMenu({ markdown, title, trigger }: DocExportMenuProps) {
  const [copied, setCopied] = useState(false);

  // Copy markdown to clipboard
  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      toast.success('Copied to clipboard');
      log.info('Doc copied to clipboard', { title });

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      log.error('Failed to copy to clipboard', { error });
      toast.error('Failed to copy to clipboard');
    }
  };

  // Download as PDF (opens print dialog for now - can be enhanced later)
  const handleDownloadPDF = () => {
    // Create a new window with the markdown content styled for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to download PDF');
      return;
    }

    // Convert markdown to HTML (basic conversion for now)
    const htmlContent = markdownToBasicHtml(markdown);

    // Write the content with print styles
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
              line-height: 1.6;
              color: #1a1a1a;
            }
            h1 { font-size: 24px; margin-bottom: 24px; }
            h2 { font-size: 18px; margin-top: 32px; margin-bottom: 12px; color: #333; }
            p { margin-bottom: 16px; }
            strong { font-weight: 600; }
            em { font-style: italic; color: #666; }
            hr { border: none; border-top: 1px solid #e0e0e0; margin: 32px 0; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `);
    printWindow.document.close();

    // Trigger print dialog
    setTimeout(() => {
      printWindow.print();
    }, 250);

    log.info('PDF print dialog opened', { title });
    toast.success('Print dialog opened');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Export
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopyMarkdown}>
          {copied ? (
            <Check className="w-4 h-4 mr-2 text-success" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          Copy as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadPDF}>
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Basic markdown to HTML conversion.
 * Handles headers, bold, italic, and horizontal rules.
 */
function markdownToBasicHtml(markdown: string): string {
  return markdown
    // Headers
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr>')
    // Paragraphs (lines not already converted)
    .replace(/^(?!<[h|p|hr])(.+)$/gm, '<p>$1</p>')
    // Clean up empty paragraphs
    .replace(/<p><\/p>/g, '');
}
