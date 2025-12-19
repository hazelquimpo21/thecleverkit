/**
 * DOC LIST ITEM
 * ==============
 * Single item in the generated docs list.
 * Shows doc title, date, status, and smart actions.
 *
 * Features:
 * - Shows "Open in Docs" when already exported (not generic Export)
 * - Freshness indicator when brand data changed
 * - View, export, and delete actions
 *
 * @created 2025-12-19 - Initial docs feature implementation
 * @updated 2025-12-19 - Added smart export buttons based on state
 */

'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  FileText,
  Eye,
  Trash2,
  MoreVertical,
  Loader2,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DocExportMenu } from './doc-export-menu';
import { GoogleIcon } from '@/components/integrations';
import { formatRelativeTime } from '@/lib/utils/format';
import { useDeleteDoc } from '@/hooks';
import { isDocStale } from '@/lib/docs/state';
import { cn } from '@/lib/utils/cn';
import type { Brand, GeneratedDoc } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface DocListItemProps {
  /** The generated doc */
  doc: GeneratedDoc;

  /** Brand for freshness checking */
  brand?: Brand;

  /** Callback when view is clicked */
  onView: () => void;
}

// ============================================================================
// INLINE ALERT DIALOG
// ============================================================================

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogContent = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AlertDialogPrimitive.Portal>
    <AlertDialogPrimitive.Overlay
      className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Content>
  </AlertDialogPrimitive.Portal>
));
AlertDialogContent.displayName = 'AlertDialogContent';

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);

const AlertDialogTitle = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = 'AlertDialogTitle';

const AlertDialogDescription = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = 'AlertDialogDescription';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * List item for a generated doc with smart actions.
 *
 * @example
 * <DocListItem doc={doc} brand={brand} onView={() => setSelectedDoc(doc)} />
 */
export function DocListItem({ doc, brand, onView }: DocListItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteDoc = useDeleteDoc();

  const isDeleting = deleteDoc.isPending && deleteDoc.variables?.docId === doc.id;

  const handleDelete = () => {
    deleteDoc.mutate(
      { docId: doc.id, brandId: doc.brand_id },
      { onSuccess: () => setShowDeleteDialog(false) }
    );
  };

  // Format the date
  const dateText = formatRelativeTime(doc.created_at);

  // Check states
  const hasGoogleDoc = !!doc.google_doc_url;
  const stale = brand ? isDocStale(doc, brand) : false;

  return (
    <>
      <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/20 transition-colors">
        {/* Doc info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm truncate">{doc.title}</p>
              {/* Stale indicator */}
              {stale && (
                <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                  <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                  Outdated
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{dateText}</span>
              {/* Google Docs status */}
              {hasGoogleDoc && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-[var(--color-docs)]">
                    <GoogleIcon className="w-3 h-3" />
                    In Docs
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions - smart buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* View button */}
          <Button variant="ghost" size="sm" onClick={onView}>
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>

          {/* Smart export: "Open in Docs" when exported, otherwise export menu */}
          {hasGoogleDoc ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(doc.google_doc_url!, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Open in Docs
            </Button>
          ) : doc.content_markdown ? (
            <DocExportMenu
              markdown={doc.content_markdown}
              title={doc.title}
              docId={doc.id}
              isExported={false}
              trigger={
                <Button variant="ghost" size="sm">
                  Export
                </Button>
              }
            />
          ) : null}

          {/* More menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="w-4 h-4 mr-2" />
                View
              </DropdownMenuItem>
              {hasGoogleDoc && (
                <DropdownMenuItem onClick={() => window.open(doc.google_doc_url!, '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Docs
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{doc.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </AlertDialogPrimitive.Action>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
