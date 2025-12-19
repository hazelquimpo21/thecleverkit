/**
 * MISSING DATA DIALOG
 * ====================
 * Shows what data is missing to generate a specific doc template.
 * Helps users understand what they need before generation.
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

'use client';

import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AnalyzerType } from '@/types';
import type { MissingField } from '@/lib/docs/types';

// ============================================================================
// TYPES
// ============================================================================

interface MissingDataDialogProps {
  /** Whether the dialog is open */
  open: boolean;

  /** Callback when dialog should close */
  onOpenChange: (open: boolean) => void;

  /** Template display name */
  templateName: string;

  /** Which analyzers are missing */
  missingAnalyzers: AnalyzerType[];

  /** Which specific fields are missing */
  missingFields: MissingField[];
}

// ============================================================================
// HELPERS
// ============================================================================

const analyzerDisplayNames: Record<AnalyzerType, string> = {
  basics: 'Business Basics',
  customer: 'Customer Analysis',
  products: 'Products & Services',
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Dialog explaining what data is needed for a template.
 *
 * @example
 * <MissingDataDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   templateName="Golden Circle"
 *   missingAnalyzers={['customer']}
 *   missingFields={[]}
 * />
 */
export function MissingDataDialog({
  open,
  onOpenChange,
  templateName,
  missingAnalyzers,
  missingFields,
}: MissingDataDialogProps) {
  const hasMissingAnalyzers = missingAnalyzers.length > 0;
  const hasMissingFields = missingFields.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle className="w-5 h-5" />
            <DialogTitle>More Data Needed</DialogTitle>
          </div>
          <DialogDescription>
            To generate the <span className="font-medium">{templateName}</span> document,
            we need a bit more information about this brand.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Missing analyzers section */}
          {hasMissingAnalyzers && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Missing analysis:</p>
              <div className="flex flex-wrap gap-2">
                {missingAnalyzers.map(analyzer => (
                  <Badge key={analyzer} variant="outline">
                    {analyzerDisplayNames[analyzer]}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                These analyzers need to complete before generating this document.
              </p>
            </div>
          )}

          {/* Missing fields section */}
          {hasMissingFields && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Missing information:</p>
              <ul className="space-y-1">
                {missingFields.map((field, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    {field.description}
                    <span className="text-xs opacity-60">
                      (from {analyzerDisplayNames[field.analyzer]})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
