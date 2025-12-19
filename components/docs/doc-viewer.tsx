/**
 * DOC VIEWER
 * ===========
 * Renders generated doc content in a readable format.
 * Displays structured content from Golden Circle and other templates.
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DocExportMenu } from './doc-export-menu';
import type { GeneratedDoc } from '@/types';
import type { GoldenCircleContent } from '@/lib/docs/templates/golden-circle/types';

// ============================================================================
// TYPES
// ============================================================================

interface DocViewerProps {
  /** The generated doc to display */
  doc: GeneratedDoc;

  /** Callback when close button is clicked */
  onClose: () => void;
}

// ============================================================================
// GOLDEN CIRCLE RENDERER
// ============================================================================

function GoldenCircleViewer({ content }: { content: GoldenCircleContent }) {
  return (
    <div className="space-y-6">
      {/* Why Section */}
      <section>
        <h3 className="text-lg font-semibold mb-2 text-primary">Why</h3>
        <p className="font-medium text-foreground mb-1">{content.why.headline}</p>
        <p className="text-muted-foreground">{content.why.explanation}</p>
      </section>

      {/* How Section */}
      <section>
        <h3 className="text-lg font-semibold mb-2 text-primary">How</h3>
        <p className="font-medium text-foreground mb-1">{content.how.headline}</p>
        <p className="text-muted-foreground">{content.how.explanation}</p>
      </section>

      {/* What Section */}
      <section>
        <h3 className="text-lg font-semibold mb-2 text-primary">What</h3>
        <p className="font-medium text-foreground mb-1">{content.what.headline}</p>
        <p className="text-muted-foreground">{content.what.explanation}</p>
      </section>

      {/* Summary */}
      <section className="pt-4 border-t border-border">
        <p className="text-muted-foreground italic">{content.summary}</p>
      </section>
    </div>
  );
}

// ============================================================================
// GENERIC CONTENT RENDERER
// ============================================================================

function GenericContentViewer({ content }: { content: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      <pre className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-4 rounded-lg overflow-auto">
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Full-screen doc viewer with export options.
 *
 * @example
 * {selectedDoc && (
 *   <DocViewer doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
 * )}
 */
export function DocViewer({ doc, onClose }: DocViewerProps) {
  const isGoldenCircle = doc.template_id === 'golden-circle';
  const content = doc.content as Record<string, unknown>;

  return (
    <Card className="border-2">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl">{doc.title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Generated {new Date(doc.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {doc.content_markdown && (
            <DocExportMenu markdown={doc.content_markdown} title={doc.title} />
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isGoldenCircle && content ? (
          <GoldenCircleViewer content={content as GoldenCircleContent} />
        ) : (
          <GenericContentViewer content={content} />
        )}
      </CardContent>
    </Card>
  );
}
