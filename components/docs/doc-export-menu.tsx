/**
 * DOC EXPORT MENU
 * =================
 * Dropdown menu for exporting generated docs.
 * Shows intelligent options based on current export state.
 *
 * Features:
 * - Copy markdown to clipboard
 * - Download as PDF (via print dialog)
 * - Google Docs integration:
 *   - "Save to Google Docs" when not exported
 *   - "Open in Google Docs" when already exported
 *   - "Export again" option for re-exporting
 *
 * @created 2025-12-19 - Initial docs feature implementation
 * @updated 2025-12-19 - Added state-aware export options
 */

'use client';

import { Copy, Download, ChevronDown, Check, Loader2, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/sonner';
import { log } from '@/lib/utils/logger';
import { useGoogleIntegration } from '@/hooks';
import { GoogleConnectModal, GoogleIcon } from '@/components/integrations';

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

  /** Document ID for Google Docs export */
  docId?: string;

  /** Whether doc is already exported to Google Docs */
  isExported?: boolean;

  /** URL to existing Google Doc (if exported) */
  googleDocUrl?: string | null;

  /** Callback when Google export completes */
  onGoogleExported?: (url: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Dropdown menu with export options for a doc.
 * Shows intelligent options based on export state.
 *
 * @example
 * // Not exported yet
 * <DocExportMenu
 *   markdown={doc.content_markdown}
 *   title={doc.title}
 *   docId={doc.id}
 *   isExported={false}
 * />
 *
 * @example
 * // Already exported
 * <DocExportMenu
 *   markdown={doc.content_markdown}
 *   title={doc.title}
 *   docId={doc.id}
 *   isExported={true}
 *   googleDocUrl="https://docs.google.com/document/d/..."
 * />
 */
export function DocExportMenu({
  markdown,
  title,
  trigger,
  docId,
  isExported = false,
  googleDocUrl,
  onGoogleExported,
}: DocExportMenuProps) {
  const [copied, setCopied] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Google integration hook
  const {
    isConnected: isGoogleConnected,
    exportToGoogleDocs,
    isExporting,
  } = useGoogleIntegration();

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

  // Open existing Google Doc
  const handleOpenGoogleDoc = () => {
    if (googleDocUrl) {
      window.open(googleDocUrl, '_blank');
      log.info('Opened Google Doc', { title, url: googleDocUrl });
    }
  };

  // Export to Google Docs (new export)
  const handleGoogleDocsExport = () => {
    if (!docId) {
      toast.error('Document ID is required for Google Docs export');
      return;
    }

    if (!isGoogleConnected) {
      // Show connect modal
      setShowConnectModal(true);
      return;
    }

    // Proceed with export
    log.info('Exporting to Google Docs', { title, docId });
    exportToGoogleDocs(docId, {
      onSuccess: (data) => {
        log.success('Exported to Google Docs', { title, url: data.googleDocUrl });
        onGoogleExported?.(data.googleDocUrl);
      },
    });
  };

  // Handle when Google is connected via modal
  const handleGoogleConnected = () => {
    if (docId) {
      // Automatically export after connecting
      exportToGoogleDocs(docId, {
        onSuccess: (data) => {
          onGoogleExported?.(data.googleDocUrl);
        },
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm">
              Export
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* Standard export options */}
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

          {/* Google Docs section - only show if docId is provided */}
          {docId && (
            <>
              <DropdownMenuSeparator />

              {/* Already exported → Show "Open" as primary */}
              {isExported && googleDocUrl ? (
                <>
                  <DropdownMenuLabel className="text-xs text-foreground-muted font-normal">
                    Google Docs
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleOpenGoogleDoc}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in Google Docs
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleGoogleDocsExport}
                    disabled={isExporting}
                    className="text-foreground-muted"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <GoogleIcon className="w-4 h-4 mr-2" />
                    )}
                    {isExporting ? 'Exporting...' : 'Export again'}
                  </DropdownMenuItem>
                </>
              ) : (
                /* Not exported yet → Show "Save to Google Docs" */
                <DropdownMenuItem
                  onClick={handleGoogleDocsExport}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <GoogleIcon className="w-4 h-4 mr-2" />
                  )}
                  {isExporting ? 'Saving...' : 'Save to Google Docs'}
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Connect Google modal */}
      <GoogleConnectModal
        open={showConnectModal}
        onOpenChange={setShowConnectModal}
        onConnected={handleGoogleConnected}
      />
    </>
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
